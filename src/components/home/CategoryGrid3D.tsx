'use client';

import { motion } from 'framer-motion';

const categories = [
  { name: 'Electronics', emoji: '💻', color: 'from-blue-500 to-cyan-500' },
  { name: 'Fashion', emoji: '👔', color: 'from-pink-500 to-rose-500' },
  { name: 'Home & Garden', emoji: '🏠', color: 'from-green-500 to-teal-500' },
  { name: 'Sports', emoji: '⚽', color: 'from-orange-500 to-red-500' },
  { name: 'Books', emoji: '📚', color: 'from-purple-500 to-indigo-500' },
  { name: 'Food & Drink', emoji: '🍔', color: 'from-yellow-500 to-orange-500' },
];

export const CategoryGrid3D = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, rotateX: 90 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section className="py-20 px-4 md:px-8 bg-background relative overflow-hidden">
      {/* Section background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Browse Categories</span>
          </h2>
          <p className="text-foreground/60 text-lg">Explore our premium collection across multiple categories</p>
        </motion.div>

        {/* Categories grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {categories.map((category, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotateY: 10 }}
              transition={{ duration: 0.3 }}
              className="group cursor-pointer"
            >
              <div className="glass-effect-hover p-8 rounded-2xl h-full flex flex-col items-center justify-center text-center transform transition-all duration-300">
                {/* Animated background gradient */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 -z-10" />

                {/* Emoji with rotation */}
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-6xl mb-6"
                >
                  {category.emoji}
                </motion.div>

                {/* Category name */}
                <h3 className="text-2xl font-bold text-foreground mb-2">{category.name}</h3>

                {/* Animated underline */}
                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                  className="h-1 bg-gradient-to-r from-primary to-secondary rounded-full"
                />

                {/* Hover indicator */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-6 text-primary text-sm font-semibold"
                >
                  ↓ Explore
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
