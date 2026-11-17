"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getToken,
  clearToken,
  getMyProfile,
  updateMyProfile,
  type FetchedProfile,
} from "@/lib/auth";

// ========== GENDER (mirrors backend enum com.recallradar.backend.dto.Gender) ==========
// State always holds the backend enum value ("MALE", "NON_BINARY", ...).
// The UI only shows a friendly label; anything coming in or going out is
// normalized to uppercase so it always matches the enum.
const GENDER_OPTIONS = [
  "MALE",
  "FEMALE",
  "TRANSGENDER",
  "NON_BINARY",
  "PREFER_NOT_TO_ANSWER",
];

// "PREFER_NOT_TO_ANSWER" -> "Prefer not to answer", "NON_BINARY" -> "Non binary"
const toGenderLabel = (value: string) => {
  const s = value.toLowerCase().replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// "Non-binary" / "non binary" / "male" -> "NON_BINARY" / "MALE"
const toGenderEnum = (value?: string | null) =>
  (value ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");

// Resolve a saved gender into one of GENDER_OPTIONS. "Other" was removed as a
// choice, so an old OTHER / free-text value comes back empty and the user is
// asked to pick again.
const resolveGender = (value?: string | null): string => {
  if (!value || !value.trim()) return "";
  const asEnum = toGenderEnum(value);
  return GENDER_OPTIONS.includes(asEnum) ? asEnum : "";
};

// Child gender uses the same backend enum as the adult question.
const CHILD_GENDER_OPTIONS = GENDER_OPTIONS;

type ChildForm = {
  age: string;
  gender: string;
  allergies: string[]; // labels, e.g. ["Peanut", "Other"]
  allergiesOther: string; // free text when "Other" is ticked
};

const emptyChild = (): ChildForm => ({
  age: "",
  gender: "",
  allergies: [],
  allergiesOther: "",
});

// /me returns a few fields that FetchedProfile in lib/auth.ts doesn't declare yet.
type MeProfile = FetchedProfile & {
  externalRefId?: string | null;
  active?: boolean | null;
  gender?: string | null;
  medications?: string[] | null;
  medicalDevices?: string[] | null;
};

// A brand-new account still gets a /me response (name + email), but none of
// the form fields are filled. Only treat it as an existing registration when
// real profile data is present.
// Where inactive accounts are sent to choose a plan.
const SUBSCRIBE_PATH = "/subscribe";

const hasSavedProfileData = (p: MeProfile | null): boolean =>
  !!p &&
  !!(
    p.city ||
    p.stateCode ||
    p.zipCode ||
    p.age != null ||
    p.gender ||
    (p.categories && p.categories.length > 0)
  );

// ========== STABLE HELPER COMPONENTS ==========
const CheckboxGroup = ({
  options,
  selected,
  onChange,
  label,
  otherValue,
  setOtherValue,
  otherLabel = "Other",
  required = false,
  error,
  id,
}: any) => (
  <div id={id} className="mb-6 scroll-mt-28">
    <label className="block text-lg font-semibold text-gray-800 mb-3">
      {label}
      {required && <span className="text-red-500"> *</span>}
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
    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
  </div>
);

// Section error text (used for vehicle / people blocks that aren't CheckboxGroups)
const SectionError = ({ message }: { message?: string }) =>
  message ? <p className="text-red-500 text-sm mt-1 mb-3">{message}</p> : null;

const RadioGroup = ({
  options,
  value,
  onChange,
  label,
  name,
  getLabel = (opt: string) => opt,
}: any) => (
  <div className="mb-6">
    <label className="block text-lg font-semibold text-gray-800 mb-3">
      {label}
    </label>
    <div className="flex flex-wrap gap-4">
      {options.map((opt: string) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name || label}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="w-4 h-4 text-blue-600"
          />
          <span>{getLabel(opt)}</span>
        </label>
      ))}
    </div>
  </div>
);

// Helper component for a single child entry.
// Stateless: everything lives in the parent's childrenList, so removing a
// child never shifts typed text into the wrong card.
const ChildEntry = ({
  child,
  index,
  updateChild,
  removeChild,
  canRemove,
  allergyOptions,
  showErrors,
}: {
  child: ChildForm;
  index: number;
  updateChild: (index: number, updates: Partial<ChildForm>) => void;
  removeChild: (index: number) => void;
  canRemove: boolean;
  allergyOptions: string[];
  showErrors: boolean;
}) => {
  const noAllergies = child.allergies.length === 0;

  const toggleAllergy = (opt: string) => {
    const next = child.allergies.includes(opt)
      ? child.allergies.filter((a) => a !== opt)
      : [...child.allergies, opt];
    updateChild(index, {
      allergies: next,
      allergiesOther: next.includes("Other") ? child.allergiesOther : "",
    });
  };

  const ageMissing = showErrors && !child.age.trim();
  const genderMissing = showErrors && !!child.age.trim() && !child.gender;

  const chip = (checked: boolean) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition ${
      checked
        ? "bg-blue-600 border-blue-600 text-white"
        : "bg-white/60 border-gray-200 text-gray-700 hover:bg-white"
    }`;

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
          <label
            htmlFor={`child-${index}-age`}
            className="block text-gray-600 text-sm mb-1"
          >
            Age <span className="text-red-500">*</span>
          </label>
          <input
            id={`child-${index}-age`}
            type="number"
            min={0}
            max={25}
            value={child.age}
            onChange={(e) => updateChild(index, { age: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg bg-white/60 border outline-none focus:border-blue-500 ${
              ageMissing ? "border-red-400" : "border-gray-200"
            }`}
            placeholder="e.g., 5"
          />
        </div>
        <div>
          <label
            htmlFor={`child-${index}-gender`}
            className="block text-gray-600 text-sm mb-1"
          >
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            id={`child-${index}-gender`}
            value={child.gender}
            onChange={(e) => updateChild(index, { gender: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg bg-white/60 border outline-none focus:border-blue-500 ${
              genderMissing ? "border-red-400" : "border-gray-200"
            }`}
          >
            <option value="">Select gender</option>
            {CHILD_GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {toGenderLabel(g)}
              </option>
            ))}
          </select>
          {genderMissing && (
            <p className="text-red-500 text-xs mt-1">Please select a gender.</p>
          )}
        </div>
      </div>

      <fieldset className="mt-4 border-0 p-0 m-0 min-w-0">
        <legend className="block text-gray-600 text-sm mb-2">
          Allergies (optional, select all that apply)
        </legend>
        <div className="flex flex-wrap gap-2">
          <label className={chip(noAllergies)}>
            <input
              type="checkbox"
              className="sr-only"
              checked={noAllergies}
              onChange={() =>
                updateChild(index, { allergies: [], allergiesOther: "" })
              }
            />
            {noAllergies && <span aria-hidden="true">✓</span>}
            No allergies
          </label>
          {allergyOptions.map((opt) => {
            const checked = child.allergies.includes(opt);
            return (
              <label key={opt} className={chip(checked)}>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggleAllergy(opt)}
                />
                {checked && <span aria-hidden="true">✓</span>}
                {opt}
              </label>
            );
          })}
        </div>
        {child.allergies.includes("Other") && (
          <input
            type="text"
            value={child.allergiesOther}
            onChange={(e) =>
              updateChild(index, { allergiesOther: e.target.value })
            }
            placeholder="Other allergies, separated by commas"
            aria-label={`Child ${index + 1} other allergies`}
            className="mt-2 w-full px-3 py-2 rounded-lg bg-white/60 border border-gray-200 focus:border-blue-500 outline-none"
          />
        )}
      </fieldset>
    </div>
  );
};

function FormPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Empty by default — the greeting falls back to "there" in the JSX only,
  // so a placeholder name is never sent to the backend.
  const [firstName, setFirstName] = useState(
    searchParams.get("firstName") || "",
  );
  const [lastName, setLastName] = useState(
    searchParams.get("lastName") || "",
  );
  const [profileEmail, setProfileEmail] = useState(
    searchParams.get("email") || "",
  );
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [externalRefId, setExternalRefId] = useState("");
  // "new"    → first-time registration: /me has no saved data, user fills everything.
  // "update" → returning user: /me has saved data, form is prefilled for editing.
  const [mode, setMode] = useState<"new" | "update">("new");
  const isUpdate = mode === "update";
  // Inactive subscription + existing profile → form is read-only.
  // First-time registration is never locked (mirrors backend updateUser()).
  const [isLocked, setIsLocked] = useState(false);

  // ========== BASIC INFO ==========
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [gender, setGender] = useState("");
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
    "Furniture/Appliances",
    "Automotive",
    "Cleaning products",
    "Clothes",
    "Cosmetics",
    "Food (allergens, contaminations...)",
    "Home goods (cookware, candles, décor)",
    "Medications, supplements, medical devices",
    "Pet products (food, toys...)",
    "Sports/Recreation",
    "Tools",
    "Toys/Kids products (car seats, strollers...)",
  ];
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // ========== OPTION LISTS (mirror the ones rendered below, used to reverse
  // ========== the enum/uppercase values the backend stores back into labels)
  const foodAllergyOptions = [
    "Egg",
    "Fish",
    "Milk",
    "Peanut",
    "Shellfish",
    "Soy",
    "Tree nuts",
    "Other",
  ];
  const groceryStoreOptions = [
    "ACME",
    "Amazon",
    "Albertson's",
    "BJ's",
    "Costco",
    "Dollar Tree",
    "Family Dollar",
    "Food Lion",
    "Giant",
    "IGA",
    "Kroger",
    "Publix",
    "Safeway",
    "Sam's Club",
    "Save a Lot",
    "Target",
    "Trader Joe's",
    "Vons",
    "Walmart",
    "Wegmans",
    "Whole Foods",
    "Other",
  ];
  const petOptions = [
    "Bird",
    "Cat",
    "Dog",
    "Fish",
    "Hamster",
    "Rabbit",
    "Snake",
    "Other",
  ];
  const petShopOptions = [
    "Amazon",
    "Chewy",
    "Petco",
    "Petsmart",
    "Pet Supermarket",
    "Pet Supplies Plus",
    "Walmart",
    "Other",
  ];
  const sportsOptions = [
    "Arts and Crafts",
    "Basketball",
    "Baseball",
    "Biking/Cycling",
    "Cars",
    "Fishing",
    "Football",
    "Gardening",
    "Recreational vehicles (ATVs, 4 wheelers)",
    "Running",
    "Soccer",
    "Snow sports (skiing, snowboarding)",
    "Traveling",
    "Woodworking",
    "Other",
  ];
  const healthConditionOptions = [
    "Cancer",
    "Dementia",
    "Diabetes",
    "Heart disease",
    "Kidney disease",
    "Lung disease",
    "Obesity",
    "Stroke",
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
    // Older saves used a misspelled label; map it to the current option.
    const aliases: Record<string, string> = { VONNS: "VONS" };
    const selected: string[] = [];
    const leftovers: string[] = [];
    for (const v of values) {
      const upper = v.toUpperCase();
      const match = byUpper.get(aliases[upper] ?? upper);
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

  // ========== CHILDREN ==========
  const [hasChildren, setHasChildren] = useState("");
  const [childrenList, setChildrenList] = useState<ChildForm[]>([
    emptyChild(),
  ]);

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
    "Egg",
    "Fish",
    "Milk",
    "Peanut",
    "Shellfish",
    "Soy",
    "Tree nuts",
    "Other",
  ];

  // ========== PREFILL FROM EXISTING PROFILE (logged-in users) ==========
  useEffect(() => {
    if (!getToken()) return; // fresh signup — nothing saved to prefill

    setLoadingProfile(true);
    getMyProfile().then((raw: FetchedProfile | null) => {
      const profile = raw as MeProfile | null;
      if (!profile) {
        // No profile (or fetch failed) — behave as a first-time registration.
        setMode("new");
        setLoadingProfile(false);
        return;
      }

      // Name/email are known even for a brand-new account.
      if (profile.firstName) setFirstName(profile.firstName);
      if (profile.lastName) setLastName(profile.lastName);
      if (profile.email) setProfileEmail(profile.email);
      if (profile.externalRefId) setExternalRefId(profile.externalRefId);

      if (!hasSavedProfileData(profile)) {
        // Registered but never filled the form — keep everything empty.
        setMode("new");
        setLoadingProfile(false);
        return;
      }

      setMode("update");
      setIsLocked(profile.active === false);
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
            // Saved as "PEANUT,MILK,SESAME": known codes become ticked
            // options, anything else goes back into the "Other" textbox.
            const codes = (c.allergies || "")
              .split(",")
              .map((a) => a.trim())
              .filter((a) => a && a.toUpperCase() !== "OTHER");
            const known: string[] = [];
            const unknown: string[] = [];
            codes.forEach((code) => {
              const label = allergyReverseMap[code.toUpperCase()];
              if (label && label !== "Other") known.push(label);
              else unknown.push(code);
            });
            const hadOther =
              unknown.length > 0 ||
              (c.allergies || "").toUpperCase().split(",").includes("OTHER");
            return {
              age: c.age != null ? String(c.age) : "",
              gender: resolveGender(c.gender),
              allergies: hadOther ? [...known, "Other"] : known,
              allergiesOther: unknown.join(", "),
            };
          }),
        );
      }

      const allergyMatch = matchOptions(profile.allergies, foodAllergyOptions);
      // "No allergies" isn't stored — if Food was saved with no allergies,
      // that's what the user picked last time.
      setFoodAllergies(
        allergyMatch.selected.length === 0 &&
          profile.categories?.includes("FOOD")
          ? ["No allergies"]
          : allergyMatch.selected,
      );
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
      setHealthConditions(
        healthMatch.selected.length === 0 &&
          profile.categories?.includes("MEDICATIONS")
          ? ["None"]
          : healthMatch.selected,
      );
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

      // Gender: prefer the top-level enum field from /me ("MALE"),
      // fall back to the copy stored inside lifestyleNotes.
      let notes: any = null;
      if (profile.lifestyleNotes) {
        try {
          notes = JSON.parse(profile.lifestyleNotes);
        } catch (err) {
          console.error("Could not parse saved lifestyle notes:", err);
        }
      }
      setGender(resolveGender(profile.gender || notes?.gender));

      const meds = profile.medications?.length
        ? profile.medications
        : Array.isArray(notes?.medications)
          ? notes.medications
          : [];
      if (meds.length) setMedications(meds.join(", "));
      const devices = profile.medicalDevices?.length
        ? profile.medicalDevices
        : Array.isArray(notes?.medicalDevices)
          ? notes.medicalDevices
          : [];
      if (devices.length) setMedicalDevices(devices.join(", "));

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
      setChildrenList([...childrenList, emptyChild()]);
    } else {
      alert("Maximum 5 children allowed.");
    }
  };

  const updateChild = (index: number, updates: Partial<ChildForm>) => {
    setChildrenList((list) =>
      list.map((c, i) => (i === index ? { ...c, ...updates } : c)),
    );
  };
  const [showChildErrors, setShowChildErrors] = useState(false);

  const removeChild = (index: number) => {
    if (childrenList.length > 1) {
      setChildrenList(childrenList.filter((_, i) => i !== index));
    } else {
      alert("You must have at least one child if you have children.");
    }
  };

  // ========== CATEGORY SECTION VALIDATION ==========
  // Every question inside a section that's opened by a selected recall
  // category is mandatory. Errors are shown inline once the user has tried
  // to submit, and update live as they fix them.
  const [showSectionErrors, setShowSectionErrors] = useState(false);

  // Toggle helper for groups with a "none" option ("No allergies", "None"):
  // picking it clears the rest, picking anything else clears it.
  const toggleWithNone =
    (setter: React.Dispatch<React.SetStateAction<string[]>>, noneOpt: string) =>
    (opt: string) =>
      setter((prev) => {
        if (prev.includes(opt)) return prev.filter((x) => x !== opt);
        if (opt === noneOpt) return [noneOpt];
        return [...prev.filter((x) => x !== noneOpt), opt];
      });

  const getSectionErrors = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    const has = (label: string) => selectedCategories.includes(label);
    const needOther = (sel: string[], other: string) =>
      sel.includes("Other") && !other.trim();

    const checkGroup = (
      key: string,
      sel: string[],
      other: string,
      emptyMsg: string,
    ) => {
      if (sel.length === 0) errs[key] = emptyMsg;
      else if (needOther(sel, other))
        errs[key] = 'Please specify your "Other" answer.';
    };

    if (has("Food (allergens, contaminations...)")) {
      checkGroup(
        "foodAllergies",
        foodAllergies,
        foodAllergiesOther,
        'Please select your food allergies (or "No allergies").',
      );
      checkGroup(
        "groceryStores",
        groceryStores,
        groceryStoresOther,
        "Please select at least one grocery store.",
      );
    }

    if (has("Automotive")) {
      const filled = vehicles.filter((v) => v.make || v.model || v.year);
      const maxYear = new Date().getFullYear() + 1;
      const incomplete = filled.some(
        (v) => !v.make.trim() || !v.model.trim() || !v.year.trim(),
      );
      const badYear = filled.some((v) => {
        const y = parseInt(v.year);
        return v.year.trim() !== "" && (isNaN(y) || y < 1900 || y > maxYear);
      });
      if (filled.length === 0)
        errs.vehicles = "Please add at least one vehicle (make, model and year).";
      else if (incomplete)
        errs.vehicles = "Each vehicle needs a make, model and year.";
      else if (badYear)
        errs.vehicles = `Vehicle year must be between 1900 and ${maxYear}.`;
    }

    if (has("Pet products (food, toys...)")) {
      checkGroup("pets", pets, petsOther, "Please select at least one pet.");
      checkGroup(
        "petShops",
        petShops,
        petShopsOther,
        "Please select where you shop for your pet.",
      );
    }

    if (has("Sports/Recreation")) {
      checkGroup(
        "sports",
        sportsActivities,
        sportsOther,
        "Please select at least one activity.",
      );
    }

    if (has("Clothes") || has("Cosmetics")) {
      const filled = people.filter((p) => p.age || p.gender);
      const incomplete = filled.some((p) => !p.age.trim() || !p.gender);
      const badAge = filled.some((p) => {
        const a = parseInt(p.age);
        return p.age.trim() !== "" && (isNaN(a) || a < 0 || a > 120);
      });
      if (filled.length === 0)
        errs.people = "Please add at least one person (age and gender).";
      else if (incomplete) errs.people = "Each person needs an age and a gender.";
      else if (badAge) errs.people = "Please enter a valid age (0–120).";
    }

    if (has("Medications, supplements, medical devices")) {
      checkGroup(
        "health",
        healthConditions,
        healthConditionsOther,
        'Please select health conditions (or "None").',
      );
    }

    return errs;
  };

  const sectionErrors = showSectionErrors ? getSectionErrors() : {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      router.push(SUBSCRIBE_PATH);
      return;
    }
    if (isSubmitting || loadingProfile) return;

    if (!city || !state || !gender || !age) {
      alert("Please fill in all required basic fields.");
      return;
    }
    if (selectedCategories.length === 0) {
      alert("Please select at least one recall category.");
      return;
    }

    const errs = getSectionErrors();
    const errKeys = Object.keys(errs);
    if (errKeys.length > 0) {
      setShowSectionErrors(true);
      document
        .getElementById(`section-${errKeys[0]}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      alert(
        "Please complete the highlighted questions for the recall categories you selected.",
      );
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
        if (child.age.trim() === "") continue;
        const a = parseInt(child.age);
        if (isNaN(a) || a < 0 || a > 25) {
          setShowChildErrors(true);
          alert(`Please enter a valid age for child ${i + 1}.`);
          return;
        }
        if (!child.gender) {
          setShowChildErrors(true);
          alert(`Please select a gender for child ${i + 1}.`);
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

    const emailFromUrl = searchParams.get("email") || profileEmail || "";
    if (!emailFromUrl && !getToken()) {
      alert(
        "You're not signed in. Please go back and sign up or log in again.",
      );
      return;
    }

    const categories = selectedCategories.map(mapCategory);

    // Only send data for sections that are actually active. Hidden sections
    // keep their old state in memory (e.g. children entered before switching
    // to "No", or allergies under a category that was deselected). Sending
    // that stale state made updates look like they "didn't save" — the
    // backend received the old children and kept hasChildren = true.
    const wantsChildren = hasChildren === "Yes";
    // "Other" free text → uppercase values, comma separated allowed
    const splitOther = (text: string) =>
      text
        .split(",")
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean);
    const hasFood = selectedCategories.includes(
      "Food (allergens, contaminations...)",
    );
    const hasPets = selectedCategories.includes("Pet products (food, toys...)");
    const hasAutomotive = selectedCategories.includes("Automotive");
    const hasSports = selectedCategories.includes("Sports/Recreation");
    const hasMedical = selectedCategories.includes(
      "Medications, supplements, medical devices",
    );

    const allergies = hasFood
      ? foodAllergies
          .filter((a) => a !== "No allergies" && a !== "Other")
          .map(mapAllergy)
      : [];
    const petsList = hasPets ? pets.map(mapPet) : [];
    const brands = [
      ...(hasFood
        ? groceryStores
            .filter((s) => s !== "Other")
            .map((s) => s.toUpperCase())
        : []),
      ...(hasFood && groceryStores.includes("Other")
        ? splitOther(groceryStoresOther)
        : []),
      ...(hasPets
        ? petShops.filter((s) => s !== "Other").map((s) => s.toUpperCase())
        : []),
      ...(hasPets && petShops.includes("Other")
        ? splitOther(petShopsOther)
        : []),
    ];
    const health = hasMedical
      ? [
          ...healthConditions
            .filter((c) => c !== "None" && c !== "Other")
            .map((c) => c.toUpperCase()),
          ...(healthConditions.includes("Other")
            ? splitOther(healthConditionsOther)
            : []),
        ]
      : [];

    // Build childrenArray for payload — empty when "No" is selected, so the
    // backend removes previously saved children.
    const childrenArray = (wantsChildren ? childrenList : [])
      .filter((child) => child.age.trim() !== "")
      .map((child) => {
        // Stored as one comma-separated string ("PEANUT,MILK,SESAME"); the
        // matching engine already splits child allergies on commas.
        const codes = [
          ...child.allergies.filter((a) => a !== "Other").map(mapAllergy),
          ...(child.allergies.includes("Other")
            ? splitOther(child.allergiesOther).length
              ? splitOther(child.allergiesOther)
              : ["OTHER"]
            : []),
        ];
        const unique = [...new Set(codes)];
        return {
          age: parseInt(child.age),
          gender: child.gender || null,
          allergies: unique.length ? unique.join(",") : null,
        };
      });

    const vehiclesArray = (hasAutomotive ? vehicles : [])
      .filter((v) => v.make || v.model || v.year)
      .map((v) => ({
        make: v.make,
        model: v.model,
        year: v.year ? parseInt(v.year) : null,
      }));

    const sports = hasSports
      ? sportsActivities
          .filter((a) => a !== "Other")
          .concat(sportsOther ? [sportsOther] : [])
      : [];

    const medicationsArray = (hasMedical ? medications : "")
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m);
    const medicalDevicesArray = (hasMedical ? medicalDevices : "")
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d);

    // Updated payload with lastName
    const userPayload = {
      email: emailFromUrl,
      // Keep the existing id on update; only generate one for a new registration.
      externalRefId:
        externalRefId || crypto.randomUUID?.() || Date.now().toString(),
      source: "API",
      age: age ? parseInt(age) : null,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
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
      // Always one of the backend Gender enum constants (uppercase).
      // Free text typed under "Other" is NOT sent here — it would fail enum
      // deserialization on the backend.
      gender: toGenderEnum(gender) || null,
      sportsActivities: sports,
      medications: medicationsArray,
      medicalDevices: medicalDevicesArray,
      hasChildren: wantsChildren,
    };

    setIsSubmitting(true);
    try {
      const result = await updateMyProfile(userPayload);
      if (result.ok) {
        alert(
          isUpdate
            ? "Your profile has been updated."
            : "Registration complete! Your preferences have been saved.",
        );
        // After a first-time save, the account now has data — any further
        // visit to this page is an update.
        setMode("update");
        router.push("/thank-you");
      } else if (result.status === 402) {
        // Backend: SubscriptionRequiredException → 402 Payment Required.
        // Handled separately from 401/403 so the user is NOT logged out.
        setIsLocked(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        alert(
          result.message ||
            "Your account is inactive. Choose a plan to reactivate it.",
        );
      } else if (result.status === 401 || result.status === 403) {
        clearToken();
        alert("Your session has expired. Please log in again.");
        router.push(
          `/auth${emailFromUrl ? `?email=${encodeURIComponent(emailFromUrl)}` : ""}`,
        );
      } else {
        alert(
          result.status >= 500
            ? "We couldn't save your profile because of a problem on our side. Please try again in a few minutes. If it keeps happening, contact support."
            : result.message,
        );
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
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
              🎉 {isUpdate ? "Welcome back" : "Welcome"}, {firstName || "there"}!
            </div>
            {isLocked && (
              <div className="max-w-2xl mx-auto mb-4 text-left bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4">
                <p className="font-semibold">Your account is inactive</p>
                <p className="text-sm mt-1">
                  You can see your saved preferences below, but recall alerts
                  are paused and changes can&apos;t be saved. Choose a plan to
                  reactivate your account, or contact support.
                </p>
                <button
                  type="button"
                  onClick={() => router.push(SUBSCRIBE_PATH)}
                  className="mt-3 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition"
                >
                  See plans
                </button>
              </div>
            )}
            {loadingProfile && (
              <p className="text-blue-600 text-sm mb-2">
                Loading your saved information…
              </p>
            )}
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Thank you for joining!
            </h1>
            {isUpdate ? (
              <p className="text-gray-600 mt-2 text-lg">
                You can modify your selections below and we will update our
                recall radar search for you.
              </p>
            ) : (
              <>
                <p className="text-gray-600 mt-2 text-lg">
                  Continue below to get{" "}
                  <strong>personalized</strong> product recall notifications.
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  By providing a little more information, you'll receive
                  recall alerts that are relevant to you.
                </p>
              </>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass-card p-8 rounded-2xl shadow-xl space-y-8"
          >
            {/* A disabled <fieldset> makes every input inside read-only
                when the subscription is inactive. */}
            <fieldset
              disabled={isLocked}
              className={`space-y-8 min-w-0 border-0 p-0 m-0 ${isLocked ? "opacity-70" : ""}`}
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
                  name="gender"
                  options={GENDER_OPTIONS}
                  value={gender}
                  onChange={(v: string) => setGender(toGenderEnum(v))}
                  getLabel={toGenderLabel}
                  label=""
                />
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
                  id="section-foodAllergies"
                  required
                  error={sectionErrors.foodAllergies}
                  label="Do you have food allergies?"
                  options={["No allergies", ...foodAllergyOptions]}
                  selected={foodAllergies}
                  onChange={toggleWithNone(setFoodAllergies, "No allergies")}
                  otherValue={foodAllergiesOther}
                  setOtherValue={setFoodAllergiesOther}
                />
                <CheckboxGroup
                  id="section-groceryStores"
                  required
                  error={sectionErrors.groceryStores}
                  label="Where do you typically shop for groceries?"
                  options={groceryStoreOptions}
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
              <div id="section-vehicles" className="border-t pt-6 scroll-mt-28">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Vehicle information <span className="text-red-500">*</span>
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Add at least one vehicle. Each vehicle you add needs a make,
                  model and year.
                </p>
                <SectionError message={sectionErrors.vehicles} />
                {vehicles.map((v, idx) => (
                  <div
                    key={idx}
                    className="mb-3 p-3 bg-white/30 rounded-xl"
                  >
                    {/* The vehicle number is a label above the row, so each
                        box only needs "Make" / "Model" / "Year" and stays
                        readable on narrow phone screens. */}
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Vehicle {idx + 1}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        aria-label={`Vehicle ${idx + 1} make`}
                        placeholder="Make (e.g. Toyota)"
                        value={v.make}
                        onChange={(e) =>
                          setVehicles((prev) =>
                            prev.map((veh, i) =>
                              i === idx ? { ...veh, make: e.target.value } : veh,
                            ),
                          )
                        }
                        className="w-full min-w-0 px-3 py-2 rounded-lg bg-white/60 border border-gray-200"
                      />
                      <input
                        type="text"
                        aria-label={`Vehicle ${idx + 1} model`}
                        placeholder="Model (e.g. Camry)"
                        value={v.model}
                        onChange={(e) =>
                          setVehicles((prev) =>
                            prev.map((veh, i) =>
                              i === idx ? { ...veh, model: e.target.value } : veh,
                            ),
                          )
                        }
                        className="w-full min-w-0 px-3 py-2 rounded-lg bg-white/60 border border-gray-200"
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        aria-label={`Vehicle ${idx + 1} year`}
                        placeholder="Year (e.g. 2020)"
                        value={v.year}
                        onChange={(e) =>
                          setVehicles((prev) =>
                            prev.map((veh, i) =>
                              i === idx ? { ...veh, year: e.target.value } : veh,
                            ),
                          )
                        }
                        className="w-full min-w-0 px-3 py-2 rounded-lg bg-white/60 border border-gray-200"
                      />
                    </div>
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
                  id="section-pets"
                  required
                  error={sectionErrors.pets}
                  label="What pets do you have?"
                  options={petOptions}
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
                  id="section-petShops"
                  required
                  error={sectionErrors.petShops}
                  label="Where do you shop for your pet?"
                  options={petShopOptions}
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
                  id="section-sports"
                  required
                  error={sectionErrors.sports}
                  label="What sports/recreational activities do you enjoy?"
                  options={sportsOptions}
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
              <div id="section-people" className="border-t pt-6 scroll-mt-28">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Who are we monitoring clothes or cosmetics recalls for?{" "}
                  <span className="text-red-500">*</span>
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Add at least one person. Each person you add needs an age and
                  a gender.
                </p>
                <SectionError message={sectionErrors.people} />
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
                            i === idx
                              ? { ...p, gender: toGenderEnum(e.target.value) }
                              : p,
                          ),
                        )
                      }
                      className="px-3 py-2 rounded-lg bg-white/60 border border-gray-200"
                    >
                      <option value="">Gender</option>
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {toGenderLabel(g)}
                        </option>
                      ))}
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
                  id="section-health"
                  required
                  error={sectionErrors.health}
                  label="Does anyone in your household have health conditions?"
                  options={["None", ...healthConditionOptions]}
                  selected={healthConditions}
                  onChange={toggleWithNone(setHealthConditions, "None")}
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
                name="hasChildren"
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
                    showErrors={showChildErrors}
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
                  Enter an age and gender for each child.
                </p>
              </div>
            )}

            </fieldset>

            <button
              type="submit"
              disabled={isSubmitting || loadingProfile}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 text-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loadingProfile
                ? "Loading your data…"
                : isLocked
                  ? "See plans to reactivate"
                  : isSubmitting
                  ? isUpdate
                    ? "Updating your profile…"
                    : "Registering…"
                  : isUpdate
                    ? "Update my profile"
                    : "Register"}
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