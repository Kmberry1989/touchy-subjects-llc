import React, {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  Menu,
  X,
  ChevronRight,
  ShoppingBag,
  Move,
  PenTool,
  Home as HomeIcon,
  Shirt
} from "lucide-react";

const CATEGORIES = [
  {
    id: "wear",
    name: "Wear",
    icon: ShoppingBag,
    color: "#8B5CF6",
    desc: "Haptic Adornments"
  },
  {
    id: "feel",
    name: "Feel",
    icon: Move,
    color: "#3B82F6",
    desc: "Tactile EDC"
  },
  {
    id: "home",
    name: "Home",
    icon: HomeIcon,
    color: "#10B981",
    desc: "Sensory Interior"
  },
  {
    id: "desk",
    name: "Desk",
    icon: PenTool,
    color: "#F59E0B",
    desc: "Kinetic Office"
  },
  {
    id: "thread",
    name: "Thread",
    icon: Shirt,
    color: "#EF4444",
    desc: "Textile Architecture"
  }
];

const PRODUCTS = [
  {
    id: 1,
    category: "feel",
    name: "The Slider",
    price: "$85",
    desc: "Precision machined plates with adjustable magnetic tension.",
    image:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    category: "wear",
    name: "The Axis Ring",
    price: "$120",
    desc: "Matte black band with a rotating knurled copper cylinder.",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    category: "desk",
    name: "The Pendulum Pen",
    price: "$95",
    desc: "Balanced rollerball with a silent, spinning cap.",
    image:
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 4,
    category: "home",
    name: "The Lid",
    price: "$150",
    desc: "3lb charcoal velvet lap pillow weighted with glass microbeads.",
    image:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 5,
    category: "thread",
    name: "Secret Hoodie",
    price: "$110",
    desc: "Heavyweight fleece with hidden friction loops.",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 6,
    category: "desk",
    name: "The Topo Pad",
    price: "$75",
    desc: "Recycled leather mat with topographic ridges.",
    image:
      "https://images.unsplash.com/photo-1616412411311-594ddd7609f2?auto=format&fit=crop&q=80&w=800"
  }
];

const HERO_COLORS = CATEGORIES.slice(0, 4);

function MorphingBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    let cancelled = false;
    let teardown = () => {};

    import("three").then((THREE) => {
      if (cancelled || !container) {
        return;
      }

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      const geometry = new THREE.PlaneGeometry(2, 2);

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uResolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight)
          },
          uMouse: { value: new THREE.Vector2(0, 0) }
        },
        vertexShader: `
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec2 uResolution;
          uniform vec2 uMouse;
          varying vec2 vUv;

          vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

          float snoise(vec2 v) {
            const vec4 C = vec4(
              0.211324865405187,
              0.366025403784439,
              -0.577350269189626,
              0.024390243902439
            );

            vec2 i = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);

            vec3 p = permute(
              permute(i.y + vec3(0.0, i1.y, 1.0)) +
              i.x + vec3(0.0, i1.x, 1.0)
            );

            vec3 m = max(
              0.5 - vec3(
                dot(x0, x0),
                dot(x12.xy, x12.xy),
                dot(x12.zw, x12.zw)
              ),
              0.0
            );

            m = m * m;
            m = m * m;

            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;

            m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

            vec3 g;
            g.x = a0.x * x0.x + h.x * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;

            return 130.0 * dot(m, g);
          }

          void main() {
            vec2 uv = vUv * 2.0 - 1.0;
            uv.x *= uResolution.x / uResolution.y;

            float dist = distance(uv, uMouse);
            float mouseEffect = smoothstep(0.8, 0.0, dist) * 0.5;

            float noiseScale = 1.8 + mouseEffect;
            float n = snoise(uv * noiseScale + vec2(uTime * 0.1));

            float ridges = sin(n * 12.0 + uTime * 0.5);
            ridges = smoothstep(0.0, 0.1, ridges) - smoothstep(0.1, 0.2, ridges);

            vec3 purple = vec3(0.545, 0.361, 0.965);
            vec3 blue = vec3(0.231, 0.510, 0.965);
            vec3 green = vec3(0.063, 0.725, 0.506);
            vec3 bg = vec3(0.984, 0.984, 0.980);

            vec3 color = mix(purple, blue, n * 0.5 + 0.5);
            color = mix(color, green, ridges);

            gl_FragColor = vec4(mix(bg, color, ridges * 0.15), 1.0);
          }
        `
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      let frameId = 0;

      const handleResize = () => {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      };

      const handlePointerMove = (event) => {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;
        const aspect = window.innerWidth / window.innerHeight;
        material.uniforms.uMouse.value.set(x * aspect, y);
      };

      const animate = (time) => {
        material.uniforms.uTime.value = time * 0.001;
        renderer.render(scene, camera);
        frameId = window.requestAnimationFrame(animate);
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      frameId = window.requestAnimationFrame(animate);

      teardown = () => {
        window.cancelAnimationFrame(frameId);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("pointermove", handlePointerMove);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.forceContextLoss();

        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    });

    return () => {
      cancelled = true;
      teardown();
    };
  }, []);

  return <div ref={containerRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />;
}

function Section({ children, className = "", id }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [scrolled, setScrolled] = useState(false);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltY, { stiffness: 150, damping: 18, mass: 0.5 });
  const rotateY = useSpring(tiltX, { stiffness: 150, damping: 18, mass: 0.5 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") {
      return PRODUCTS;
    }

    return PRODUCTS.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  const activeCategoryMeta = useMemo(() => {
    if (activeCategory === "all") {
      return {
        name: "All",
        desc: "Every tactile category",
        color: "#121212"
      };
    }

    return CATEGORIES.find((category) => category.id === activeCategory) ?? CATEGORIES[0];
  }, [activeCategory]);

  const setCategory = (categoryId) => {
    startTransition(() => {
      setActiveCategory(categoryId);
    });
  };

  const handleHeroMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    tiltX.set((px - 0.5) * 10);
    tiltY.set((0.5 - py) * 10);
  };

  const resetHeroTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas text-ink selection:bg-orange/20 font-body">
      <MorphingBackground />

      <nav
        className={`fixed inset-x-0 top-0 z-[100] transition-all duration-700 ${
          scrolled ? "bg-white/90 py-4 shadow-2xl backdrop-blur-2xl" : "bg-transparent py-6 md:py-12"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6">
          <a href="#top" className="group flex cursor-pointer flex-col">
            <span className="font-display text-3xl font-black uppercase leading-none tracking-[-0.08em] md:text-4xl">
              Touchy Subjects
            </span>
            <div className="mt-2 flex space-x-1">
              {CATEGORIES.map((category) => (
                <div
                  key={category.id}
                  className="h-2 w-5 rounded-full transition-transform duration-300 group-hover:scale-x-110"
                  style={{ backgroundColor: category.color }}
                />
              ))}
            </div>
          </a>

          <div className="hidden items-center space-x-8 lg:flex xl:space-x-14">
            {CATEGORIES.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={() => setCategory(category.id)}
                className="relative py-2 text-sm font-black uppercase tracking-[0.3em] transition-all"
                style={{
                  color: activeCategory === category.id ? category.color : "#444",
                  fontWeight: activeCategory === category.id ? 900 : 700
                }}
              >
                {category.name}
                {activeCategory === category.id ? (
                  <motion.span
                    layoutId="underline"
                    className="absolute inset-x-0 -bottom-1 h-1 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                ) : null}
              </motion.button>
            ))}
            <a
              href="#collection"
              className="rounded-full bg-ink px-10 py-4 text-sm font-black uppercase tracking-[0.25em] text-white transition-all hover:scale-110 hover:shadow-2xl"
            >
              Shop
            </a>
          </div>

          <button
            className="lg:hidden"
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={40} /> : <Menu size={40} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-[110] flex flex-col bg-white p-12"
          >
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="mb-16 self-end"
              aria-label="Close menu"
            >
              <X size={48} />
            </button>
            <div className="flex flex-col space-y-10">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setCategory(category.id);
                    setIsMenuOpen(false);
                  }}
                  className="text-left font-display text-5xl font-black uppercase tracking-[-0.08em] md:text-6xl"
                  style={{ color: category.color }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main id="top" className="relative z-10">
        <section className="relative flex min-h-screen items-center overflow-hidden pt-28 md:pt-20">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-16 px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:gap-20">
            <div className="order-2 lg:order-1">
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8 text-sm font-black uppercase tracking-[0.35em] text-black/45"
              >
                Elevated tactile tools from Kokomo, Indiana
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-[4.4rem] font-black uppercase leading-[0.82] tracking-[-0.1em] md:text-[7.2rem] xl:text-[10rem]"
              >
                Feel{" "}
                <motion.span
                  animate={{
                    backgroundImage: [
                      "linear-gradient(to right, #8B5CF6, #3B82F6)",
                      "linear-gradient(to right, #3B82F6, #10B981)",
                      "linear-gradient(to right, #F59E0B, #EF4444)",
                      "linear-gradient(to right, #EF4444, #8B5CF6)"
                    ]
                  }}
                  transition={{ duration: 12, repeat: Infinity, repeatType: "mirror" }}
                  className="inline-block text-transparent bg-clip-text"
                >
                  Touchy.
                </motion.span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mb-12 mt-8 max-w-2xl text-2xl font-semibold leading-relaxed text-black/55 md:text-3xl"
              >
                Elevated tactile tools for focused minds. Born from the vibrant Kokomo art scene.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col gap-5 sm:flex-row"
              >
                <a
                  href="#collection"
                  className="group inline-flex items-center justify-center bg-ink px-10 py-6 text-sm font-black uppercase tracking-[0.3em] text-white shadow-2xl transition-all hover:scale-105"
                >
                  The Collection
                  <ChevronRight size={22} className="ml-4 transition-transform group-hover:translate-x-2" />
                </a>
                <a
                  href="#story"
                  className="inline-flex items-center justify-center border-4 border-black/5 bg-white px-10 py-6 text-sm font-black uppercase tracking-[0.3em] transition-all hover:bg-black/[0.03]"
                >
                  The Story
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="order-1 lg:order-2"
            >
              <div className="perspective-panel relative mx-auto aspect-square w-full max-w-2xl">
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-6 p-8 opacity-40 blur-2xl transition-all duration-700 hover:blur-3xl md:gap-8 md:p-12">
                  {HERO_COLORS.map((category, index) => (
                    <motion.div
                      key={category.id}
                      animate={{ borderRadius: ["4rem", "8rem", "4rem"] }}
                      transition={{ duration: 6, delay: index * 0.5, repeat: Infinity }}
                      className="h-full w-full"
                      style={{ backgroundColor: category.color }}
                    />
                  ))}
                </div>
                <motion.div
                  onMouseMove={handleHeroMove}
                  onMouseLeave={resetHeroTilt}
                  style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                  className="relative z-10"
                >
                  <img
                    src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000"
                    className="h-full w-full rounded-[3rem] object-cover shadow-hero transition-all duration-1000 hover:grayscale-0 md:rounded-[5rem]"
                    alt="Touchy Subjects hero product"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <Section className="relative z-10 border-y-4 border-black/[0.03] bg-white py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-5 xl:gap-10">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;

                return (
                  <motion.button
                    key={category.id}
                    whileHover={{ y: -15, scale: 1.03 }}
                    type="button"
                    onClick={() => setCategory(category.id)}
                    className={`group flex flex-col items-center rounded-[2.5rem] p-8 text-center transition-all duration-700 md:p-10 xl:rounded-[3.5rem] xl:p-12 ${
                      activeCategory === category.id
                        ? "bg-white shadow-2xl ring-1 ring-black/5"
                        : "opacity-60 hover:bg-black/[0.03] hover:opacity-100"
                    }`}
                  >
                    <div
                      className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] transition-transform group-hover:rotate-12 md:h-24 md:w-24 md:rounded-[2rem]"
                      style={{ backgroundColor: `${category.color}15`, color: category.color }}
                    >
                      <Icon size={28} />
                    </div>
                    <span
                      className="text-lg font-black uppercase tracking-[0.25em] md:text-xl"
                      style={{ color: activeCategory === category.id ? category.color : "#121212" }}
                    >
                      {category.name}
                    </span>
                    <span className="mt-4 text-[0.68rem] font-black uppercase tracking-[0.3em] text-black/30 md:text-xs">
                      {category.desc}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </Section>

        <Section id="collection" className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-40 xl:py-56">
          <div className="mb-20 flex flex-col gap-8 md:mb-32 md:flex-row md:items-end md:justify-between">
            <div>
              <p
                className="mb-5 text-sm font-black uppercase tracking-[0.35em]"
                style={{ color: activeCategoryMeta.color }}
              >
                {activeCategoryMeta.desc}
              </p>
              <h2 className="font-display text-6xl font-black uppercase leading-none tracking-[-0.1em] md:text-7xl xl:text-8xl">
                Collection
              </h2>
              <div className="mt-8 flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <motion.div
                    key={category.id}
                    animate={{ width: activeCategory === category.id ? 80 : 16 }}
                    className="h-2.5 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`rounded-full border-4 px-10 py-5 text-sm font-black uppercase tracking-[0.4em] transition-all ${
                activeCategory === "all"
                  ? "border-transparent bg-ink text-white shadow-2xl"
                  : "border-black/10 text-black/35"
              }`}
            >
              All Products
            </button>
          </div>

          <motion.div layout className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-y-24 xl:gap-x-20 xl:gap-y-32">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const category = CATEGORIES.find((item) => item.id === product.category);
                const categoryColor = category?.color ?? "#121212";

                return (
                  <motion.article
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    key={product.id}
                    className="group cursor-pointer"
                  >
                    <div className="relative mb-8 aspect-square overflow-hidden rounded-[2.5rem] bg-black/5 shadow-md transition-all duration-700 group-hover:shadow-float md:mb-10 md:rounded-[4rem] lg:mb-12 lg:rounded-[4.5rem]">
                      <img
                        src={product.image}
                        className="h-full w-full object-cover grayscale transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0"
                        alt={product.name}
                      />
                      <div
                        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-20"
                        style={{ backgroundColor: categoryColor }}
                      />
                      <div className="absolute inset-x-8 bottom-8 translate-y-12 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:inset-x-10 md:bottom-10 lg:inset-x-12 lg:bottom-12">
                        <button
                          type="button"
                          className="w-full rounded-[1.5rem] bg-white py-5 text-xs font-black uppercase tracking-[0.3em] shadow-2xl transition-transform hover:scale-105 md:rounded-[2rem] md:py-6 lg:py-7"
                        >
                          Explore Design
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-6 px-2 md:px-4 lg:px-6">
                      <div>
                        <span className="text-sm font-black uppercase tracking-[0.3em]" style={{ color: categoryColor }}>
                          {product.category}
                        </span>
                        <h3 className="mt-3 font-display text-3xl font-black uppercase tracking-[-0.07em]">
                          {product.name}
                        </h3>
                        <p className="mt-5 max-w-xs text-lg font-bold leading-tight text-black/40 xl:text-xl">
                          {product.desc}
                        </p>
                      </div>
                      <span className="shrink-0 text-3xl font-black">{product.price}</span>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </Section>

        <Section id="story" className="relative z-10 overflow-hidden bg-white py-24 md:py-40 xl:py-64">
          <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 md:grid-cols-2 md:gap-24 xl:gap-32">
            <motion.div whileHover={{ scale: 1.02 }} className="group relative aspect-square overflow-hidden rounded-[3rem] shadow-2xl md:rounded-[5rem]">
              <img
                src="https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=1200"
                className="h-full w-full object-cover"
                alt="Kokomo creative heritage"
              />
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute bottom-10 left-10 text-white md:bottom-16 md:left-16">
                <span className="font-display text-6xl font-black italic tracking-[-0.08em] md:text-8xl">
                  Kokomo
                </span>
                <p className="mt-4 text-sm font-black uppercase tracking-[0.45em] opacity-80 md:mt-6 md:text-lg md:tracking-[0.6em]">
                  Indiana Heritage
                </p>
              </div>
            </motion.div>

            <div>
              <h2 className="font-display text-6xl font-black uppercase leading-[0.85] tracking-[-0.1em] md:text-7xl xl:text-8xl">
                Rooted in <br />
                <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                  Pure Craft.
                </span>
              </h2>
              <p className="mb-10 mt-8 text-2xl font-bold leading-relaxed text-black/55 md:mb-16 md:text-3xl">
                Born from the artistic heartbeat of the Kokomo Art Association. We curate experiences
                for the restless mind through industrial art.
              </p>
              <a
                href="https://kokomoartassociation.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center bg-ink px-10 py-6 text-sm font-black uppercase tracking-[0.4em] text-white shadow-2xl transition-all hover:scale-105"
              >
                The Association
              </a>
            </div>
          </div>
        </Section>
      </main>

      <footer className="relative z-20 bg-ink py-24 text-white md:py-32 xl:py-48">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 grid grid-cols-1 gap-14 md:mb-24 md:grid-cols-4 md:gap-12 xl:mb-32 xl:gap-20">
            <div>
              <span className="font-display text-4xl font-black uppercase leading-none tracking-[-0.08em] md:text-5xl">
                Touchy <br />
                Subjects
              </span>
              <p className="mt-8 max-w-xs text-lg font-bold leading-relaxed text-white/35 md:mt-12 md:text-xl">
                Premium sensory tools for the restless mind. Curated in the heart of the Midwest.
              </p>
            </div>

            {["Pillars", "Company", "Social"].map((title) => (
              <div key={title}>
                <h4 className="mb-8 text-sm font-black uppercase tracking-[0.35em] text-white/35 md:mb-12">
                  {title}
                </h4>
                <ul className="space-y-5 md:space-y-8">
                  {["Category One", "Category Two", "Category Three"].map((link) => (
                    <li key={link}>
                      <a href="#collection" className="text-lg font-bold text-white/45 transition-colors hover:text-white md:text-xl">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-start justify-between gap-8 border-t border-white/10 pt-10 text-xs font-black uppercase tracking-[0.35em] text-white/20 md:flex-row md:items-center md:text-sm md:tracking-[0.5em] xl:pt-20">
            <span>&copy; 2026 Touchy Subjects LLC.</span>
            <div className="flex flex-wrap gap-8 md:gap-16">
              <a
                href="https://www.facebook.com/KokomoArtAssociation"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-white"
              >
                Facebook
              </a>
              <a
                href="https://www.instagram.com/kokomoartassociation"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-white"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
