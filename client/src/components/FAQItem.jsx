import { useState } from "react";
import { motion } from "framer-motion";

export default function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b pb-4 cursor-pointer" onClick={() => setOpen(!open)}>
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-800 text-lg leading-snug max-w-[90%]">
          {question}
        </h4>

        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-gray-600 text-xl select-none"
        >
          ▼
        </motion.span>
      </div>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="text-gray-600 mt-3 text-base leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </div>
  );
}
