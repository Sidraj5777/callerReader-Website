"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getToken,
  getMyProfile,
  updateMyProfile,
  type FetchedProfile,
} from "@/lib/auth";

// ========== STABLE HELPER COMPONENTS ==========
const CheckboxGroup = ({
  options,
  selected,
  onChange,
  label,
  otherValue,
  setOtherValue,
  otherLabel = "Other",
}: any) => (
  <div className="mb-6">
    <label className="block text-lg font-semibold text-gray-800 mb-3">
      {label}
    </label>
    <div className="flex flex-wrap gap-3">
      {options.map((opt: string) => (
        <label
          key={opt}
          className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full border border-gray-200 cursor-pointer hover:bg-white/70"
        >
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => onChange(opt)}
            className="w-4 h-4 text-blue-600"
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
    {selected.includes(otherLabel) && (
      <input
        type="text"
        value={otherValue}
        onChange={(e) => setOtherValue(e.target.value)}
        placeholder="Please specify"
        className="mt-3 w-full px-4 py-2 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 outline-none"
      />
    )}
  </div>
);

const RadioGroup = ({ options, value, onChange, label }: any) => (
  <div className="mb-6">
    <label className="block text-lg font-semibold text-gray-800 mb-3">
      {label}
    </label>
    <div className="flex flex-wrap gap-4">
      {options.map((opt: string) => (
        <label key={opt} className="flex items-center gap-2">
          <input
            type="radio"
            name={label}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="w-4 h-4 text-blue-600"
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

// Helper component for a single child entry
const ChildEntry = ({
  child,
  index,
  updateChild,
  removeChild,
  canRemove,
  allergyOptions,
}: any) => {
  const [allergyOther, setAllergyOther] = useState(child.allergiesOther || "");

  const handleAllergyChange = (value: string) => {
    updateChild(index, {
      allergies: value,
      allergiesOther: value === "Other" ? allergyOther : "",
    });
  };

  const handleOtherTextChange = (text: string) => {
    setAllergyOther(text);
    updateChild(index, { allergies: "Other", allergiesOther: text });
  };

  return (
    <div className="p-4 bg-white/40 rounded-xl border border-gray-200 mb-4">
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-gray-700">Child {index + 1}</h4>
        {canRemove && (
          <button
            type="button"
            onClick={() => removeChild(index)}
            className="text-red-500 text-sm hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div>
          <label className="block text-gray-600 text-sm mb-1">
            Age (required) *
          </label>
          <input
            type="number"
            value={child.age}
            onChange={(e) => updateChild(index, { age: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white/60 border border-gray-200 focus:border-blue-500 outline-none"
            placeholder="e.g., 5"
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm mb-1">
            Allergies (optional)
          </label>
          <select
            value={child.allergies || ""}
            onChange={(e) => handleAllergyChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/60 border border-gray-200 focus:border-blue-500 outline-none"
          >
            <option value="">No allergies</option>
            {allergyOptions.map(
              (
                opt: string, // Fixed: added :string type
              ) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ),
            )}
          </select>
          {child.allergies === "Other" && (
            <input
              type="text"
              value={allergyOther}
              onChange={(e) => handleOtherTextChange(e.target.value)}
              placeholder="Please specify allergy"
              className="mt-2 w-full px-3 py-2 rounded-lg bg-white/60 border border-gray-200 focus:border-blue-500 outline-none"
            />
          )}
        </div>
      </div>
    </div>
  );
};

function FormPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [firstName, setFirstName] = useState(
    searchParams.get("firstName") || "there",
  );
  const [lastName, setLastName] = useState(
    searchParams.get("lastName") || "there",
  );
  const [loadingProfile, setLoadingProfile] = useState(false);
  // getToken() reads localStorage, which doesn't exist on the server. Calling
  // it directly in the JSX below made the server always render "Welcome" and
  // then the client immediately swap in "Welcome back" if a token existed —
  // a hydration mismatch. Track it in state instead, set only after mount.
  const [hasStoredToken, setHasStoredToken] = useState(false);

  // ========== BASIC INFO ==========
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [gender, setGender] = useState("");
  const [genderOther, setGenderOther] = useState("");
  const [age, setAge] = useState("");
  const [zipCode, setZipCode] = useState("");

  // ========== CITY/STATE API STATES ==========
  const [statesList, setStatesList] = useState<string[]>([]);
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingZip, setIsLoadingZip] = useState(false);
  const [statesError, setStatesError] = useState("");

  // ========== STATE CODE MAPPING ==========
  const stateCodeMap: Record<string, string> = {
    Alabama: "AL",
    Alaska: "AK",
    Arizona: "AZ",
    Arkansas: "AR",
    California: "CA",
    Colorado: "CO",
    Connecticut: "CT",
    Delaware: "DE",
    Florida: "FL",
    Georgia: "GA",
    Hawaii: "HI",
    Idaho: "ID",
    Illinois: "IL",
    Indiana: "IN",
    Iowa: "IA",
    Kansas: "KS",
    Kentucky: "KY",
    Louisiana: "LA",
    Maine: "ME",
    Maryland: "MD",
    Massachusetts: "MA",
    Michigan: "MI",
    Minnesota: "MN",
    Mississippi: "MS",
    Missouri: "MO",
    Montana: "MT",
    Nebraska: "NE",
    Nevada: "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    Ohio: "OH",
    Oklahoma: "OK",
    Oregon: "OR",
    Pennsylvania: "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    Tennessee: "TN",
    Texas: "TX",
    Utah: "UT",
    Vermont: "VT",
    Virginia: "VA",
    Washington: "WA",
    "West Virginia": "WV",
    Wisconsin: "WI",
    Wyoming: "WY",
  };

  // ========== RECALL CATEGORIES ==========
  const recallCategories = [
    "Food (allergens, contaminations...)",
    "Home goods (cookware, candles, décor)",
    "Toys/Kids products (car seats, strollers...)",
    "Automotive",
    "Pet products (food, toys...)",
    "Clothes",
    "Sports/Recreation",
    "Furniture/Appliances",
    "Cleaning products",
    "Cosmetics",
    "Tools",
    "Medications, supplements, medical devices",
  ];
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // ========== OPTION LISTS (mirror the ones rendered below, used to reverse
  // ========== the enum/uppercase values the backend stores back into labels)
  const genderOptions = [
    "Male",
    "Female",
    "Transgender",
    "Non-binary",
    "PREFER_NOT_TO_ANSWER",
    "Other",
  ];
  const foodAllergyOptions = [
    "Milk",
    "Egg",
    "Peanut",
    "Tree nuts",
    "Soy",
    "Fish",
    "Shellfish",
    "Other",
  ];
  const groceryStoreOptions = [
    "ACME",
    "Publix",
    "Albertson's",
    "Sam's Club",
    "Amazon",
    "Safeway",
    "BJ's",
    "Save a Lot",
    "Costco",
    "Target",
    "Dollar Tree",
    "Trader Joe's",
    "Family Dollar",
    "Vonns",
    "Food Lion",
    "Walmart",
    "IGA",
    "Wegmans",
    "Kroger",
    "Whole Foods",
    "Other",
  ];
  const petOptions = [
    "Dog",
    "Cat",
    "Bird",
    "Fish",
    "Rabbit",
    "Hamster",
    "Snake",
    "Other",
  ];
  const petShopOptions = [
    "Petsmart",
    "Pet Supermarket",
    "Petco",
    "Pet Supplies Plus",
    "Amazon",
    "Walmart",
    "Other",
  ];
  const sportsOptions = [
    "Basketball",
    "Arts and Crafts",
    "Baseball",
    "Gardening",
    "Biking/Cycling",
    "Woodworking",
    "Soccer",
    "Running",
    "Football",
    "Traveling",
    "Fishing",
    "Cars",
    "Snow sports (skiing, snowboarding)",
    "Recreational vehicles (ATVs, 4 wheelers)",
    "Other",
  ];
  const healthConditionOptions = [
    "Kidney disease",
    "Heart disease",
    "Obesity",
    "Diabetes",
    "Stroke",
    "Dementia",
    "Cancer",
    "Lung disease",
    "Other",
  ];

  const categoryReverseMap: Record<string, string> = {
    FOOD: "Food (allergens, contaminations...)",
    HOME_GOODS: "Home goods (cookware, candles, décor)",
    TOYS_KIDS: "Toys/Kids products (car seats, strollers...)",
    AUTOMOTIVE: "Automotive",
    PET_PRODUCTS: "Pet products (food, toys...)",
    CLOTHES: "Clothes",
    SPORTS_RECREATION: "Sports/Recreation",
    FURNITURE_APPLIANCES: "Furniture/Appliances",
    CLEANING_PRODUCTS: "Cleaning products",
    COSMETICS: "Cosmetics",
    TOOLS: "Tools",
    MEDICATIONS: "Medications, supplements, medical devices",
  };
  const allergyReverseMap: Record<string, string> = {
    MILK: "Milk",
    EGG: "Egg",
    PEANUT: "Peanut",
    TREE_NUTS: "Tree nuts",
    SOY: "Soy",
    FISH: "Fish",
    SHELLFISH: "Shellfish",
    OTHER: "Other",
  };
  const stateNameByCode: Record<string, string> = Object.fromEntries(
    Object.entries(stateCodeMap).map(([name, code]) => [code, name]),
  );
  // The backend's stateCode field is NOT the two-letter abbreviation — it's
  // the full state name, uppercased (e.g. "OKLAHOMA", not "OK"), as seen in
  // GET /me responses. Map that back to the proper-cased name used by the
  // <option> values in the state <select>. Also accept a real abbreviation
  // ("OK") in case that ever comes through instead, so both formats resolve.
  const stateNameByUpperFullName: Record<string, string> = Object.fromEntries(
    Object.keys(stateCodeMap).map((name) => [name.toUpperCase(), name]),
  );
  function resolveStateName(rawStateCode: string | undefined): string {
    if (!rawStateCode) return "";
    const raw = rawStateCode.trim();
    return (
      stateNameByUpperFullName[raw.toUpperCase()] ||
      stateNameByCode[raw.toUpperCase()] ||
      ""
    );
  }

  // Matches a list of stored values (often uppercased) back against a known
  // option list. Anything that doesn't match a known option is bucketed
  // under "Other" so no saved data silently disappears.
  function matchOptions(
    values: string[] | undefined,
    knownOptions: string[],
  ): { selected: string[]; otherValue: string } {
    if (!values || values.length === 0) return { selected: [], otherValue: "" };
    const byUpper = new Map(knownOptions.map((o) => [o.toUpperCase(), o]));
    const selected: string[] = [];
    const leftovers: string[] = [];
    for (const v of values) {
      const match = byUpper.get(v.toUpperCase());
      if (match && match !== "Other") {
        if (!selected.includes(match)) selected.push(match);
      } else if (v) {
        leftovers.push(v);
      }
    }
    if (leftovers.length > 0 && knownOptions.includes("Other")) {
      selected.push("Other");
      return { selected, otherValue: leftovers.join(", ") };
    }
    return { selected, otherValue: "" };
  }

  function matchSingle(
    value: string | undefined,
    knownOptions: string[],
  ): { value: string; otherValue: string } {
    if (!value) return { value: "", otherValue: "" };
    const found = knownOptions.find(
      (o) => o.toUpperCase() === value.toUpperCase(),
    );
    if (found && found !== "Other") return { value: found, otherValue: "" };
    return knownOptions.includes("Other")
      ? { value: "Other", otherValue: value }
      : { value: "", otherValue: "" };
  }

  // ========== CHILDREN ==========
  const [hasChildren, setHasChildren] = useState("");
  const [childrenList, setChildrenList] = useState<
    Array<{ age: string; allergies: string; allergiesOther: string }>
  >([{ age: "", allergies: "", allergiesOther: "" }]);

  // ========== FOOD specific ==========
  const [foodAllergies, setFoodAllergies] = useState<string[]>([]);
  const [foodAllergiesOther, setFoodAllergiesOther] = useState("");
  const [groceryStores, setGroceryStores] = useState<string[]>([]);
  const [groceryStoresOther, setGroceryStoresOther] = useState("");

  // ========== AUTOMOTIVE ==========
  const [vehicles, setVehicles] = useState([
    { make: "", model: "", year: "" },
    { make: "", model: "", year: "" },
    { make: "", model: "", year: "" },
  ]);

  // ========== PET ==========
  const [pets, setPets] = useState<string[]>([]);
  const [petsOther, setPetsOther] = useState("");
  const [petShops, setPetShops] = useState<string[]>([]);
  const [petShopsOther, setPetShopsOther] = useState("");

  // ========== SPORTS ==========
  const [sportsActivities, setSportsActivities] = useState<string[]>([]);
  const [sportsOther, setSportsOther] = useState("");

  // ========== CLOTHES / COSMETICS ==========
  const [people, setPeople] = useState([
    { age: "", gender: "" },
    { age: "", gender: "" },
    { age: "", gender: "" },
    { age: "", gender: "" },
  ]);

  // ========== MEDICATIONS ==========
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [healthConditionsOther, setHealthConditionsOther] = useState("");
  const [medications, setMedications] = useState("");
  const [medicalDevices, setMedicalDevices] = useState("");

  // Allergy options for children dropdown
  const childAllergyOptions = [
    "Peanut",
    "Milk",
    "Egg",
    "Tree nuts",
    "Soy",
    "Fish",
    "Shellfish",
    "Other",
  ];

  // ========== PREFILL FROM EXISTING PROFILE (logged-in users) ==========
  useEffect(() => {
    if (!getToken()) return; // fresh signup — nothing saved to prefill

    setHasStoredToken(true);
    setLoadingProfile(true);
    getMyProfile().then((profile: FetchedProfile | null) => {
      if (!profile) {
        setLoadingProfile(false);
        return;
      }

      if (profile.firstName) setFirstName(profile.firstName);
      if (profile.lastName) setLastName(profile.lastName);
      if (profile.city) setCity(profile.city);
      if (profile.stateCode) {
        const stateName = resolveStateName(profile.stateCode);
        setState(stateName);
        // The city <select> only shows options from citiesList, which is
        // otherwise only populated when the user manually picks a state.
        // Fetch it here too, so a prefilled city actually shows as selected
        // instead of silently falling back to "Select a city".
        if (stateName)
          fetchCitiesForState(stateName, profile.city || undefined);
      }
      if (profile.zipCode) setZipCode(profile.zipCode);
      if (profile.age != null) setAge(String(profile.age));
      if (profile.hasChildren !== undefined) {
        setHasChildren(profile.hasChildren ? "Yes" : "No");
      }

      if (profile.categories?.length) {
        setSelectedCategories(
          profile.categories
            .map((c) => categoryReverseMap[c] || c)
            .filter(Boolean),
        );
      }

      if (profile.children?.length) {
        setChildrenList(
          profile.children.map((c) => {
            const label = c.allergies ? allergyReverseMap[c.allergies] : "";
            const isKnown = !!label && label !== "Other";
            return {
              age: c.age != null ? String(c.age) : "",
              allergies: isKnown ? label : c.allergies ? "Other" : "",
              allergiesOther: isKnown ? "" : c.allergies || "",
            };
          }),
        );
      }

      const allergyMatch = matchOptions(profile.allergies, foodAllergyOptions);
      setFoodAllergies(allergyMatch.selected);
      setFoodAllergiesOther(allergyMatch.otherValue);

      // The backend stores grocery-store and pet-shop brands in one combined
      // list with no way to tell which question they came from — so we match
      // saved brands against both known lists. A brand that fits both (e.g.
      // "Amazon", "Walmart") will show as checked in both sections; anything
      // that fits neither lands under "Other" so it's at least not lost.
      const groceryMatch = matchOptions(profile.brands, groceryStoreOptions);
      setGroceryStores(groceryMatch.selected);
      setGroceryStoresOther(groceryMatch.otherValue);
      const petShopMatch = matchOptions(profile.brands, petShopOptions);
      setPetShops(petShopMatch.selected);
      setPetShopsOther(petShopMatch.otherValue);

      const petMatch = matchOptions(profile.pets, petOptions);
      setPets(petMatch.selected);
      setPetsOther(petMatch.otherValue);

      const healthMatch = matchOptions(
        profile.healthConditions,
        healthConditionOptions,
      );
      setHealthConditions(healthMatch.selected);
      setHealthConditionsOther(healthMatch.otherValue);

      const sportsMatch = matchOptions(profile.sportsActivities, sportsOptions);
      setSportsActivities(sportsMatch.selected);
      setSportsOther(sportsMatch.otherValue);

      if (profile.vehicles?.length) {
        setVehicles(
          Array.from({ length: 3 }, (_, i) => {
            const v = profile.vehicles?.[i];
            return {
              make: v?.make || "",
              model: v?.model || "",
              year: v?.year != null ? String(v.year) : "",
            };
          }),
        );
      }

      if (profile.lifestyleNotes) {
        try {
          const notes = JSON.parse(profile.lifestyleNotes);
          if (notes.gender) {
            const genderMatch = matchSingle(notes.gender, genderOptions);
            setGender(genderMatch.value);
            setGenderOther(genderMatch.otherValue);
          }
          if (Array.isArray(notes.medications))
            setMedications(notes.medications.join(", "));
          if (Array.isArray(notes.medicalDevices))
            setMedicalDevices(notes.medicalDevices.join(", "));
        } catch (err) {
          console.error("Could not parse saved lifestyle notes:", err);
        }
      }

      setLoadingProfile(false);
    });
    // Intentionally run once on mount — this hydrates initial state from the
    // server and shouldn't re-run as the user edits the form afterward.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========== FETCH US STATES ==========
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setIsLoadingStates(true);
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: "United States" }),
          },
        );
        const data = await response.json();
        if (data.error) throw new Error(data.msg || "Failed to fetch states");
        const states = data.data.states.map((s: { name: string }) => s.name);
        setStatesList(states.sort());
      } catch (err) {
        console.error("Error fetching states:", err);
        setStatesError(
          "Could not load states. Please refresh or type manually.",
        );
        setStatesList([
          "Alabama",
          "Alaska",
          "Arizona",
          "Arkansas",
          "California",
          "Colorado",
          "Connecticut",
          "Delaware",
          "Florida",
          "Georgia",
          "Hawaii",
          "Idaho",
          "Illinois",
          "Indiana",
          "Iowa",
          "Kansas",
          "Kentucky",
          "Louisiana",
          "Maine",
          "Maryland",
          "Massachusetts",
          "Michigan",
          "Minnesota",
          "Mississippi",
          "Missouri",
          "Montana",
          "Nebraska",
          "Nevada",
          "New Hampshire",
          "New Jersey",
          "New Mexico",
          "New York",
          "North Carolina",
          "North Dakota",
          "Ohio",
          "Oklahoma",
          "Oregon",
          "Pennsylvania",
          "Rhode Island",
          "South Carolina",
          "South Dakota",
          "Tennessee",
          "Texas",
          "Utah",
          "Vermont",
          "Virginia",
          "Washington",
          "West Virginia",
          "Wisconsin",
          "Wyoming",
        ]);
      } finally {
        setIsLoadingStates(false);
      }
    };
    fetchStates();
  }, []);

  // ========== FETCH CITIES ==========
  const fetchCitiesForState = async (
    stateName: string,
    ensureCity?: string,
  ) => {
    if (!stateName) {
      setCitiesList([]);
      return;
    }
    try {
      setIsLoadingCities(true);
      const response = await fetch(
        "https://countriesnow.space/api/v0.1/countries/state/cities",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: "United States", state: stateName }),
        },
      );
      const data = await response.json();
      if (data.error) throw new Error(data.msg || "Failed to fetch cities");
      let cities: string[] = data.data || [];
      // Make sure a previously-saved city is always selectable, even if the
      // external city list doesn't happen to include it.
      if (ensureCity && !cities.includes(ensureCity)) {
        cities = [ensureCity, ...cities];
      }
      setCitiesList(cities.sort());
    } catch (err) {
      console.error("Error fetching cities:", err);
      setCitiesList(ensureCity ? [ensureCity] : []);
    } finally {
      setIsLoadingCities(false);
    }
  };

  // ========== FETCH ZIP CODE ==========
  const fetchZipCode = async (stateName: string, cityName: string) => {
    if (!stateName || !cityName) return;
    const stateAbbr = stateCodeMap[stateName];
    if (!stateAbbr) return;
    try {
      setIsLoadingZip(true);
      const response = await fetch(
        `https://api.zippopotam.us/us/${stateAbbr}/${encodeURIComponent(cityName)}`,
      );
      if (!response.ok) throw new Error("ZIP not found");
      const data = await response.json();
      if (data.places && data.places.length > 0) {
        setZipCode(data.places[0]["post code"]);
      } else {
        setZipCode("");
      }
    } catch (err) {
      console.error("ZIP fetch error:", err);
      setZipCode("");
    } finally {
      setIsLoadingZip(false);
    }
  };

  const handleStateChange = (selectedState: string) => {
    setState(selectedState);
    setCity("");
    setZipCode("");
    fetchCitiesForState(selectedState);
  };

  const handleCityChange = (selectedCity: string) => {
    setCity(selectedCity);
    setZipCode("");
    if (selectedCity && state) {
      fetchZipCode(state, selectedCity);
    }
  };

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Children management functions
  const addChild = () => {
    if (childrenList.length < 5) {
      setChildrenList([
        ...childrenList,
        { age: "", allergies: "", allergiesOther: "" },
      ]);
    } else {
      alert("Maximum 5 children allowed.");
    }
  };

  const updateChild = (
    index: number,
    updates: Partial<{
      age: string;
      allergies: string;
      allergiesOther: string;
    }>,
  ) => {
    const updated = [...childrenList];
    updated[index] = { ...updated[index], ...updates };
    setChildrenList(updated);
  };

  const removeChild = (index: number) => {
    if (childrenList.length > 1) {
      setChildrenList(childrenList.filter((_, i) => i !== index));
    } else {
      alert("You must have at least one child if you have children.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!city || !state || !gender || !age) {
      alert("Please fill in all required basic fields.");
      return;
    }
    if (selectedCategories.length === 0) {
      alert("Please select at least one recall category.");
      return;
    }
    if (!hasChildren) {
      alert("Please answer if you have children.");
      return;
    }

    // Validate children if hasChildren === "Yes"
    if (hasChildren === "Yes") {
      const hasValidChild = childrenList.some(
        (child) => child.age.trim() !== "",
      );
      if (!hasValidChild) {
        alert("Please provide age for at least one child.");
        return;
      }
      for (let i = 0; i < childrenList.length; i++) {
        const child = childrenList[i];
        if (child.age.trim() !== "" && isNaN(parseInt(child.age))) {
          alert(`Child ${i + 1} age must be a number.`);
          return;
        }
      }
    }

    // Mapping helpers
    const mapCategory = (cat: string): string => {
      const mapping: Record<string, string> = {
        "Food (allergens, contaminations...)": "FOOD",
        "Home goods (cookware, candles, décor)": "HOME_GOODS",
        "Toys/Kids products (car seats, strollers...)": "TOYS_KIDS",
        Automotive: "AUTOMOTIVE",
        "Pet products (food, toys...)": "PET_PRODUCTS",
        Clothes: "CLOTHES",
        "Sports/Recreation": "SPORTS_RECREATION",
        "Furniture/Appliances": "FURNITURE_APPLIANCES",
        "Cleaning products": "CLEANING_PRODUCTS",
        Cosmetics: "COSMETICS",
        Tools: "TOOLS",
        "Medications, supplements, medical devices": "MEDICATIONS",
      };
      return mapping[cat] || cat.toUpperCase();
    };

    const mapAllergy = (a: string): string => {
      const mapping: Record<string, string> = {
        Milk: "MILK",
        Egg: "EGG",
        Peanut: "PEANUT",
        "Tree nuts": "TREE_NUTS",
        Soy: "SOY",
        Fish: "FISH",
        Shellfish: "SHELLFISH",
        Other: "OTHER",
      };
      return mapping[a] || a.toUpperCase();
    };

    const mapPet = (p: string): string => {
      const mapping: Record<string, string> = {
        Dog: "DOG",
        Cat: "CAT",
        Bird: "BIRD",
        Fish: "FISH",
        Rabbit: "RABBIT",
        Hamster: "HAMSTER",
        Snake: "OTHER",
        Other: "OTHER",
      };
      return mapping[p] || "OTHER";
    };

    const emailFromUrl = searchParams.get("email") || "";
    if (!emailFromUrl && !getToken()) {
      alert(
        "You're not signed in. Please go back and sign up or log in again.",
      );
      return;
    }

    const categories = selectedCategories.map(mapCategory);
    const allergies = foodAllergies
      .filter((a) => a !== "No allergies" && a !== "Other")
      .map(mapAllergy);
    const petsList = pets.map(mapPet);
    const brands = [
      ...groceryStores.filter((s) => s !== "Other").map((s) => s.toUpperCase()),
      ...petShops.filter((s) => s !== "Other").map((s) => s.toUpperCase()),
    ];
    const health = healthConditions
      .filter((c) => c !== "None")
      .map((c) => c.toUpperCase());

    // Build childrenArray for payload
    const childrenArray = childrenList
      .filter((child) => child.age.trim() !== "")
      .map((child) => {
        let allergyValue: string | null = null;
        if (child.allergies && child.allergies !== "") {
          if (child.allergies === "Other") {
            allergyValue = child.allergiesOther.trim()
              ? child.allergiesOther.toUpperCase()
              : "OTHER";
          } else {
            allergyValue = mapAllergy(child.allergies);
          }
        }
        return {
          age: parseInt(child.age),
          allergies: allergyValue,
        };
      });

    const vehiclesArray = vehicles
      .filter((v) => v.make || v.model || v.year)
      .map((v) => ({
        make: v.make,
        model: v.model,
        year: v.year ? parseInt(v.year) : null,
      }));

    const sports = sportsActivities
      .filter((a) => a !== "Other")
      .concat(sportsOther ? [sportsOther] : []);

    const medicationsArray = medications
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m);
    const medicalDevicesArray = medicalDevices
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d);

    // Updated payload with lastName
    const userPayload = {
      email: emailFromUrl,
      externalRefId: crypto.randomUUID?.() || Date.now().toString(),
      source: "API",
      age: age ? parseInt(age) : null,
      firstName: firstName,
      lastName: lastName.trim() || "", // Use actual lastName input
      city: city,
      stateCode: state.toUpperCase(),
      zipCode: zipCode || null,
      categories: categories,
      brands: [...new Set(brands)],
      allergies: allergies,
      healthConditions: health,
      pets: petsList,
      children: childrenArray,
      vehicles: vehiclesArray,
      trackedUpcCodes: [],
      lifestyleNotes: null,
      gender: gender === "Other" ? genderOther : gender,
      sportsActivities: sports,
      medications: medicationsArray,
      medicalDevices: medicalDevicesArray,
      hasChildren: hasChildren === "Yes",
    };

    try {
      const result = await updateMyProfile(userPayload);
      if (result.ok) {
        alert("Preferences saved successfully!");
        router.push("/thank-you");
      } else {
        alert(`Server error: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Backgrounds */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />
      <div className="fixed inset-0 -z-10 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#3b82f6_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,#6366f1_0%,transparent_50%)]" />
      </div>
      <div className="fixed inset-0 -z-5 opacity-20 pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\' /%3E%3C/svg%3E')]" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex justify-between items-center px-6 sm:px-10 py-4 backdrop-blur-xl bg-white/70 border-b border-white/30 shadow-sm">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
          Recall Radar
        </h1>
        <button
          onClick={() => router.push("/")}
          className="px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm text-blue-800 font-semibold border border-white/30 hover:bg-white/30 transition"
        >
          ← Back to Home
        </button>
      </nav>

      {/* Form Container */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-1.5 text-blue-700 text-sm mb-4 border border-white/40">
              🎉 {hasStoredToken ? "Welcome back" : "Welcome"}, {firstName}!
            </div>
            {loadingProfile && (
              <p className="text-blue-600 text-sm mb-2">
                Loading your saved information…
              </p>
            )}
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Thank you for joining!
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Continue below to get early access to{" "}
              <strong>personalized</strong> product recall notifications.
            </p>
            <p className="text-gray-500 text-sm mt-1">
              By providing a little more information, you'll receive recall
              alerts that are relevant to you.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass-card p-8 rounded-2xl shadow-xl space-y-8"
          >
            {/* TELL US ABOUT YOURSELF */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Tell us a little more about yourself
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    What state do you live in?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 outline-none"
                    required
                    disabled={isLoadingStates}
                  >
                    <option value="">
                      {isLoadingStates ? "Loading states..." : "Select a state"}
                    </option>
                    {statesList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {statesError && (
                    <p className="text-red-500 text-sm mt-1">{statesError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    What city do you live in?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    disabled={!state || isLoadingCities}
                    className="w-full px-4 py-2 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 outline-none disabled:opacity-50"
                    required
                  >
                    <option value="">
                      {isLoadingCities
                        ? "Loading cities..."
                        : citiesList.length === 0 && state
                          ? "No cities found"
                          : "Select a city"}
                    </option>
                    {citiesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-1">
                  ZIP Code (auto‑filled, editable)
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder={
                    isLoadingZip ? "Fetching ZIP..." : "Auto‑filled from city"
                  }
                  className="w-full px-4 py-2 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ZIP code is automatically looked up when you select a city.
                  You can change it if needed.
                </p>
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-1">
                  What gender do you identify with?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <RadioGroup
                  options={[
                    "MALE",
                    "FEMALE",
                    "TRANSGENDER",
                    "NON_BINARY",
                    "PREFER_NOT_TO_ANSWER",
                    "OTHER",
                  ]}
                  value={gender}
                  onChange={setGender}
                  label=""
                />
                {gender === "Other" && (
                  <input
                    type="text"
                    value={genderOther}
                    onChange={(e) => setGenderOther(e.target.value)}
                    placeholder="Type your answer"
                    className="mt-2 w-full px-4 py-2 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 outline-none"
                  />
                )}
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-1">
                  What is your age? <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/60 border border-gray-200 focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* RECALL CATEGORIES */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                What recalls do you want to be notified about?{" "}
                <span className="text-red-500">*</span>
              </h2>
              <div className="flex flex-wrap gap-3">
                {recallCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-4 py-2 rounded-full border transition-all ${selectedCategories.includes(cat) ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white/50 border-gray-300 text-gray-700 hover:border-blue-400"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* CONDITIONAL SECTIONS (food, automotive, etc.) - unchanged */}
            {selectedCategories.includes(
              "Food (allergens, contaminations...)",
            ) && (
              <div className="border-t pt-6 mt-2">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Food related preferences
                </h3>
                <CheckboxGroup
                  label="Do you have food allergies?"
                  options={[
                    "No allergies",
                    "Milk",
                    "Egg",
                    "Peanut",
                    "Tree nuts",
                    "Soy",
                    "Fish",
                    "Shellfish",
                    "Other",
                  ]}
                  selected={foodAllergies}
                  onChange={(opt: string) =>
                    setFoodAllergies((prev) =>
                      prev.includes(opt)
                        ? prev.filter((a) => a !== opt)
                        : [...prev, opt],
                    )
                  }
                  otherValue={foodAllergiesOther}
                  setOtherValue={setFoodAllergiesOther}
                />
                <CheckboxGroup
                  label="Where do you typically shop for groceries?"
                  options={[
                    "ACME",
                    "Publix",
                    "Albertson's",
                    "Sam's Club",
                    "Amazon",
                    "Safeway",
                    "BJ's",
                    "Save a Lot",
                    "Costco",
                    "Target",
                    "Dollar Tree",
                    "Trader Joe's",
                    "Family Dollar",
                    "Vonns",
                    "Food Lion",
                    "Walmart",
                    "IGA",
                    "Wegmans",
                    "Kroger",
                    "Whole Foods",
                    "Other",
                  ]}
                  selected={groceryStores}
                  onChange={(opt: string) =>
                    setGroceryStores((prev) =>
                      prev.includes(opt)
                        ? prev.filter((s) => s !== opt)
                        : [...prev, opt],
                    )
                  }
                  otherValue={groceryStoresOther}
                  setOtherValue={setGroceryStoresOther}
                />
              </div>
            )}

            {selectedCategories.includes("Automotive") && (
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Vehicle information
                </h3>
                {vehicles.map((v, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-3 gap-3 mb-3 p-3 bg-white/30 rounded-xl"
                  >
                    <input
                      type="text"
                      placeholder={`Vehicle ${idx + 1} Make`}
                      value={v.make}
                      onChange={(e) =>
                        setVehicles((prev) =>
                          prev.map((veh, i) =>
                            i === idx ? { ...veh, make: e.target.value } : veh,
                          ),
                        )
                      }
                      className="px-3 py-2 rounded-lg bg-white/60 border border-gray-200"
                    />
                    <input
                      type="text"
                      placeholder={`Vehicle ${idx + 1} Model`}
                      value={v.model}
                      onChange={(e) =>
                        setVehicles((prev) =>
                          prev.map((veh, i) =>
                            i === idx ? { ...veh, model: e.target.value } : veh,
                          ),
                        )
                      }
                      className="px-3 py-2 rounded-lg bg-white/60 border border-gray-200"
                    />
                    <input
                      type="text"
                      placeholder={`Vehicle ${idx + 1} Year`}
                      value={v.year}
                      onChange={(e) =>
                        setVehicles((prev) =>
                          prev.map((veh, i) =>
                            i === idx ? { ...veh, year: e.target.value } : veh,
                          ),
                        )
                      }
                      className="px-3 py-2 rounded-lg bg-white/60 border border-gray-200"
                    />
                  </div>
                ))}
              </div>
            )}

            {selectedCategories.includes("Pet products (food, toys...)") && (
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Pet information
                </h3>
                <CheckboxGroup
                  label="What pets do you have?"
                  options={[
                    "Dog",
                    "Cat",
                    "Bird",
                    "Fish",
                    "Rabbit",
                    "Hamster",
                    "Snake",
                    "Other",
                  ]}
                  selected={pets}
                  onChange={(opt: string) =>
                    setPets((prev) =>
                      prev.includes(opt)
                        ? prev.filter((p) => p !== opt)
                        : [...prev, opt],
                    )
                  }
                  otherValue={petsOther}
                  setOtherValue={setPetsOther}
                />
                <CheckboxGroup
                  label="Where do you shop for your pet?"
                  options={[
                    "Petsmart",
                    "Pet Supermarket",
                    "Petco",
                    "Pet Supplies Plus",
                    "Amazon",
                    "Walmart",
                    "Other",
                  ]}
                  selected={petShops}
                  onChange={(opt: string) =>
                    setPetShops((prev) =>
                      prev.includes(opt)
                        ? prev.filter((s) => s !== opt)
                        : [...prev, opt],
                    )
                  }
                  otherValue={petShopsOther}
                  setOtherValue={setPetShopsOther}
                />
              </div>
            )}

            {selectedCategories.includes("Sports/Recreation") && (
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Sports & recreation
                </h3>
                <CheckboxGroup
                  label="What sports/recreational activities do you enjoy?"
                  options={[
                    "Basketball",
                    "Arts and Crafts",
                    "Baseball",
                    "Gardening",
                    "Biking/Cycling",
                    "Woodworking",
                    "Soccer",
                    "Running",
                    "Football",
                    "Traveling",
                    "Fishing",
                    "Cars",
                    "Snow sports (skiing, snowboarding)",
                    "Recreational vehicles (ATVs, 4 wheelers)",
                    "Other",
                  ]}
                  selected={sportsActivities}
                  onChange={(opt: string) =>
                    setSportsActivities((prev) =>
                      prev.includes(opt)
                        ? prev.filter((a) => a !== opt)
                        : [...prev, opt],
                    )
                  }
                  otherValue={sportsOther}
                  setOtherValue={setSportsOther}
                />
              </div>
            )}

            {(selectedCategories.includes("Clothes") ||
              selectedCategories.includes("Cosmetics")) && (
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Who are we monitoring clothes or cosmetics recalls for?{" "}
                  <span className="text-red-500">*</span>
                </h3>
                {people.map((person, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-2 gap-3 mb-4 p-3 bg-white/30 rounded-xl"
                  >
                    <input
                      type="text"
                      placeholder={`Person ${idx + 1} Age`}
                      value={person.age}
                      onChange={(e) =>
                        setPeople((prev) =>
                          prev.map((p, i) =>
                            i === idx ? { ...p, age: e.target.value } : p,
                          ),
                        )
                      }
                      className="px-3 py-2 rounded-lg bg-white/60 border border-gray-200"
                    />
                    <select
                      value={person.gender}
                      onChange={(e) =>
                        setPeople((prev) =>
                          prev.map((p, i) =>
                            i === idx ? { ...p, gender: e.target.value } : p,
                          ),
                        )
                      }
                      className="px-3 py-2 rounded-lg bg-white/60 border border-gray-200"
                    >
                      <option value="">Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option>Transgender</option>
                    </select>
                  </div>
                ))}
              </div>
            )}

            {selectedCategories.includes(
              "Medications, supplements, medical devices",
            ) && (
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Health & medical information
                </h3>
                <CheckboxGroup
                  label="Does anyone in your household have health conditions?"
                  options={[
                    "None",
                    "Kidney disease",
                    "Heart disease",
                    "Obesity",
                    "Diabetes",
                    "Stroke",
                    "Dementia",
                    "Cancer",
                    "Lung disease",
                    "Other",
                  ]}
                  selected={healthConditions}
                  onChange={(opt: string) =>
                    setHealthConditions((prev) =>
                      prev.includes(opt)
                        ? prev.filter((c) => c !== opt)
                        : [...prev, opt],
                    )
                  }
                  otherValue={healthConditionsOther}
                  setOtherValue={setHealthConditionsOther}
                />
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">
                    Does anyone in your household take any
                    medications/supplements/vitamins?
                  </label>
                  <input
                    type="text"
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder="Please enter each medication separated by a comma."
                    className="w-full px-4 py-2 rounded-xl bg-white/60 border border-gray-200"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">
                    Do you use any medical devices (e.g. blood pressure monitor)
                    or medical equipment (e.g. wheelchairs, walkers)?
                  </label>
                  <input
                    type="text"
                    value={medicalDevices}
                    onChange={(e) => setMedicalDevices(e.target.value)}
                    placeholder="Please enter each device separated by a comma."
                    className="w-full px-4 py-2 rounded-xl bg-white/60 border border-gray-200"
                  />
                </div>
              </div>
            )}

            {/* COMMON: Do you have children? (kept last in the form) */}
            <div className="border-t pt-6 mt-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Do you have children? <span className="text-red-500">*</span>
              </h2>
              <RadioGroup
                options={["Yes", "No"]}
                value={hasChildren}
                onChange={setHasChildren}
                label=""
              />
            </div>

            {/* CHILDREN DETAILS SECTION (shown only if "Yes") */}
            {hasChildren === "Yes" && (
              <div className="border-t pt-6 mt-2">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Children Information
                </h3>
                {childrenList.map((child, idx) => (
                  <ChildEntry
                    key={idx}
                    child={child}
                    index={idx}
                    updateChild={updateChild}
                    removeChild={removeChild}
                    canRemove={childrenList.length > 1}
                    allergyOptions={childAllergyOptions}
                  />
                ))}
                <button
                  type="button"
                  onClick={addChild}
                  className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                >
                  + Add another child
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  At least one child must have an age entered.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 text-lg"
            >
              Register →
            </button>
          </form>
        </div>
      </section>

      <footer className="relative z-10 py-8 text-center text-gray-500 text-sm border-t border-gray-200 bg-white/40 backdrop-blur-sm">
        <p>© 2025 Recall Radar – Stay protected, stay informed.</p>
      </footer>
    </div>
  );
}

export default function FormPage() {
  return (
    <Suspense fallback={null}>
      <FormPageContent />
    </Suspense>
  );
}
