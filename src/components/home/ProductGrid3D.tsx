'use client';

import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  price: number;
  emoji: string;
  rating: number;
  reviews: number;
}

interface ProductGrid3DProps {
  products?: Product[];
  title?: string;
}

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 199.99,
    emoji: '🎧',
    rating: 4.8,
    reviews: 324,
  },
  {
    id: '2',
    name: 'Luxury Watch',
    price: 449.99,
    emoji: '⌚',
    rating: 4.9,
    reviews: 156,
  },
  {
    id: '3',
    name: 'Designer Sunglasses',
    price: 299.99,
    emoji: '😎',
    rating: 4.7,
    reviews: 287,
  },
  {
    id: '4',
    name: 'Smart Home Device',
    price: 129.99,
    emoji: '📱',
    rating: 4.6,
    reviews: 412,
  },
  {
    id: '5',
    name: 'Premium Coffee Maker',
    price: 349.99,
    emoji: '☕',
    rating: 4.8,
    reviews: 198,
  },
  {
    id: '6',
    name: 'Portable Speaker',
    price: 179.99,
    emoji: '🔊',
    rating: 4.7,
    reviews: 523,
  },
];

export const ProductGrid3D = ({
  products = defaultProducts,
  title = 'Recommended For You',
}: ProductGrid3DProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, rotateY: -90 },
    visible: {
      opacity: 1,
      y: 0,
      rotateY: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 20,
      },
    },
  };

  return (
    <section className="py-20 px-4 md:px-8 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{title}</span>
          </h2>
          <p className="text-foreground/60 text-lg">Handpicked items based on your preferences</p>
        </motion.div>

        {/* Products grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={{ scale: 1.08, rotateX: 5, rotateY: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="group cursor-pointer"
            >
              <div className="glass-effect-hover p-6 rounded-2xl h-full flex flex-col transform transition-all duration-300 relative overflow-hidden">
                {/* Shimmer effect background */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent transition-opacity duration-500" />

                {/* Image placeholder with 3D effect */}
                <div className="relative mb-6 h-48 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30 group-hover:from-primary/50 group-hover:via-secondary/40 group-hover:to-accent/50 transition-all duration-500" />

                  {/* Rotating emoji */}
                  <motion.div
                    animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                    transition={{
                      rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    className="w-full h-full flex items-center justify-center text-7xl relative z-10"
                  >
                    {product.emoji}
                  </motion.div>

                  {/* Floating particles on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -40], opacity: [1, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                        className="absolute w-2 h-2 bg-primary rounded-full"
                        style={{
                          left: `${20 + i * 15}%`,
                          bottom: '10%',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Product info */}
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < Math.floor(product.rating) ? '★' : '☆'}</span>
                      ))}
                    </div>
                    <span className="text-sm text-foreground/60">({product.reviews})</span>
                  </div>
                </div>

                {/* Footer with price and CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="text-2xl font-bold text-primary">${product.price}</div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-background text-sm font-semibold rounded-lg transition-all duration-300"
                  >
                    Add
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex justify-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-all duration-300"
          >
            View All Products
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
