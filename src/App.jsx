import { useState } from "react";
import { supabase } from "./supabaseClient";
import Turnstile from "react-turnstile";

export default function ContactForm() {
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!captchaToken) {
      alert("Please verify captcha");
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Save to database
      const { error } = await supabase
        .from("contacts")
        .insert([formData]);

      if (error) throw error;

      // 2️⃣ Send email
      const response = await fetch(
        "https://enwgxqyvybcqsvqbzbip.supabase.co/functions/v1/send-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ ...formData, captchaToken }),
        }
      );

      if (!response.ok) throw new Error("Email failed");

      // 3️⃣ Reset form after success
      alert("Message sent 🚀");

      setFormData({
        name: "",
        email: "",
        message: "",
      });

      setCaptchaToken(null);

    } catch (err) {
      console.error(err);
      alert("Error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Turnstile
        sitekey="0x4AAAAAACceNZ3KrjIuKt1b"
        onSuccess={(token) => setCaptchaToken(token)}
      />

      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
        required
      />

      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />

      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Message"
        required
      />

      <button disabled={loading}>
        {loading ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
