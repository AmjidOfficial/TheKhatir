import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import { blogPosts } from "@/data/blogPosts";
import { waLink } from "@/lib/company";

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("ALL");

  const categories = ["ALL", "SUSTAINABILITY", "DESIGN", "URBAN PLANNING"];

  const filteredPosts =
    activeCategory === "ALL"
      ? blogPosts
      : blogPosts.filter((post) => post.category === activeCategory);

  const updatesMessage =
    "Assalam-o-Alaikum! I would like to receive Khatir property and project updates. Please share available options and how I can subscribe.";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Insights & Blog | Khatir Real Estate & Builders"
        description="Practical guides on buying property, construction, local areas, and real estate decisions from Khatir Real Estate & Builders."
        path="/blog"
      />
      <Navigation />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h1 className="text-6xl md:text-8xl font-light text-architectural mb-8">
                INSIGHTS
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Useful information to help you ask better questions, compare your options,
                and make more informed property and construction decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-8 justify-center md:justify-start">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                  className={`text-minimal transition-colors duration-300 relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${
                    activeCategory === category
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-px bg-foreground transition-transform duration-300 origin-left ${
                      activeCategory === category
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24 md:pb-32">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {filteredPosts.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
                <h2 className="text-2xl font-medium text-primary">More insights are on the way</h2>
                <p className="mt-3 text-muted-foreground">Please check back soon.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                {filteredPosts.map((post) => (
                  <article key={post.id} className="group">
                    <Link to={`/blog/${post.id}`} className="block">
                      <div className="relative overflow-hidden mb-6">
                        <img
                          src={post.image}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1">
                          <span className="text-xs text-foreground font-medium">{post.category}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center text-xs text-muted-foreground space-x-4">
                          <span>{post.date}</span>
                          <span aria-hidden="true">•</span>
                          <span>{post.readTime}</span>
                          <span aria-hidden="true">•</span>
                          <span>{post.author}</span>
                        </div>
                        <h2 className="text-xl lg:text-2xl font-light text-architectural group-hover:text-muted-foreground transition-colors duration-500">
                          {post.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>
                        <div className="pt-4">
                          <span className="text-minimal text-foreground transition-colors duration-300 group-hover:underline">
                            READ MORE
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-muted">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-light text-architectural mb-6">
              Get property updates
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              The newsletter signup is not connected yet. Message our team on WhatsApp to ask about
              current properties, new projects, and update options.
            </p>
            <a
              href={waLink(updatesMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#25D366] px-7 py-3 font-medium text-white transition-colors hover:bg-[#1ebe57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            >
              Ask for updates on WhatsApp
            </a>
          </div>
        </div>
      </section>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Blog;
