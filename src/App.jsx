import { useState } from "react";
import { supabase } from "./supabaseClient";
import Turnstile from "react-turnstile";

export default function ContactForm() {
  const [captchaToken, setCaptchaToken] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!captchaToken) {
      alert("Please verify captcha");
      return;
    }

    try {
      await supabase.from("contacts").insert([formData]);

      await fetch(
        "https://enwgxqyvybcqsvqbzbip.supabase.co/functions/v1/send-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ ...formData, captchaToken }),
        },
      );

      alert("Message sent 🚀");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      alert("Error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Heellloo</h1>
    <form onSubmit={handleSubmit}>
      <Turnstile
        sitekey="0x4AAAAAACceNZ3KrjIuKt1b"
        onSuccess={(token) => setCaptchaToken(token)}
      />
      <input name="name" onChange={handleChange} placeholder="Name" required />
      <input
        name="email"
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <textarea
        name="message"
        onChange={handleChange}
        placeholder="Message"
        required
      />
      <button disabled={loading}>{loading ? "Sending..." : "Send"}</button>
    </form>
      </>
  );
}
