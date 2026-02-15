import { useState } from "react";
import { supabase } from "./supabaseClient";
import Turnstile from "react-turnstile";

export default function ContactForm() {
  const [captchaToken, setCaptchaToken] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!captchaToken) {
      alert("Please verify captcha");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("contacts")
        .insert([formData]);

      if (error) throw error;

      await fetch(
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

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Error ❌");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return <h2>Thank you! Your message has been sent ✅</h2>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Turnstile
        sitekey="0x4AAAAAACceNZ3KrjIuKt1b"
        onSuccess={(token) => setCaptchaToken(token)}
      />
      <input name="name" onChange={handleChange} placeholder="Name" required />
      <input name="email" onChange={handleChange} placeholder="Email" required />
      <textarea
        name="message"
        onChange={handleChange}
        placeholder="Message"
        required
      />
      <button disabled={loading}>{loading ? "Sending..." : "Send"}</button>
    </form>
  );
}

