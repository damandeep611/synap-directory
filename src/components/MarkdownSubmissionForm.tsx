"use client";

import { createMarkdownPost } from "@/actions/markdown-posts";
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function MarkdownSubmissionForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await createMarkdownPost(formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Markdown post submitted successfully!");
      // Reset form if needed, though native form action usually doesn't without ref
      // We can use a ref to reset or just let it be for now.
      const form = document.getElementById("md-form") as HTMLFormElement;
      form?.reset();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-4xl mx-auto mt-32 p-1 border-t border-white/10 pt-20"
    >
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="md:w-1/3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-400/10 text-yellow-300 mb-6">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-serif italic text-white mb-4">Submit Resource</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Share your knowledge with the community. Create a markdown resource card that will be featured in our directory.
          </p>
        </div>

        <div className="md:w-2/3 w-full">
          <form id="md-form" action={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-2">Title</label>
              <input
                type="text"
                name="title"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all"
                placeholder="e.g. The Future of GenAI"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-2">Description</label>
              <input
                type="text"
                name="description"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all"
                placeholder="Brief summary of the content..."
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-2">Content (Markdown)</label>
              <textarea
                name="content"
                required
                rows={8}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all resize-none"
                placeholder="Write your content here..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-xl bg-white px-8 font-medium text-black transition-all duration-300 hover:bg-yellow-200 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-2">{loading ? "Submitting..." : "Create Resource"}</span>
              {!loading && <Send className="h-4 w-4 transition-all duration-300 group-hover:translate-x-1" />}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-yellow-200 via-white to-yellow-200 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
