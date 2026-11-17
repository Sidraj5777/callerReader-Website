"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

/*
 * Support form. There is no support API yet, so submitting opens the
 * visitor's email app with the message pre-filled and addressed to
 * SITE.supportEmail. To switch to a backend endpoint later, replace the
 * body of handleSubmit with a fetch() call — the fields stay the same.
 */

const topics = [
  "Account or login",
  "My household profile",
  "An alert I received",
  "An alert I expected but didn't get",
  "Subscriptions and billing",
  "Privacy or deleting my data",
  "Something else",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SupportForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(topics[0]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [opened, setOpened] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Enter your name.";
    if (!EMAIL_RE.test(email.trim())) errs.email = "Enter a valid email address so we can reply.";
    if (message.trim().length < 10) errs.message = "Tell us a little more (at least 10 characters).";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const subject = `[Support] ${topic}`;
    const body = `${message.trim()}\n\n---\nName: ${name.trim()}\nReply to: ${email.trim()}\nTopic: ${topic}`;
    window.location.href = `mailto:${SITE.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  const field = (hasError?: string) =>
    `w-full px-4 py-3 rounded-xl border bg-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
      hasError ? "border-red-400" : "border-gray-200"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="s-name" className="block text-sm font-semibold text-gray-800 mb-1.5">Name</label>
          <input id="s-name" value={name} onChange={(e) => setName(e.target.value)} className={field(errors.name)} autoComplete="name" />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="s-email" className="block text-sm font-semibold text-gray-800 mb-1.5">Email</label>
          <input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field(errors.email)} autoComplete="email" />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="s-topic" className="block text-sm font-semibold text-gray-800 mb-1.5">What can we help with?</label>
        <select id="s-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={field()}>
          {topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="s-message" className="block text-sm font-semibold text-gray-800 mb-1.5">Message</label>
        <textarea id="s-message" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className={field(errors.message)} />
        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
      </div>
      <button type="submit" className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition">
        Send message
      </button>
      {opened && (
        <p className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-xl p-3" role="status">
          Your email app should have opened with your message ready to send. If it didn&apos;t, email us directly at{" "}
          <a href={`mailto:${SITE.supportEmail}`} className="font-semibold text-blue-700 underline">{SITE.supportEmail}</a>.
        </p>
      )}
    </form>
  );
}
