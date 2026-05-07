import React from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  Users,
  Calendar,
  ArrowRight,
  Mountain,
  Camera,
  Coffee,
  Heart,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { packageService } from "../services/packages";
import { getImageUrl } from "../utils/imageUrl";

const HomePage: React.FC = () => {
  const { data: packagesData, isLoading } = useQuery({
    queryKey: ["featured-packages"],
    queryFn: () =>
      packageService.getPackages({
        limit: 6,
        sort_by: "created_at",
        sort_order: "desc",
      }),
  });

  const featuredPackages = packagesData?.data.items || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-purple-900/80 to-orange-900/90"></div>
        <div className="absolute inset-0 hero-gradient"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="animate-fade-in">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/20">
                <MapPin className="h-4 w-4 mr-2" />
                East Hararghe Zone, Ethiopia
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
              Discover East Hararghe's
              <span className="block text-gradient bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Hidden Treasures
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-white/90 leading-relaxed">
              Embark on an extraordinary journey through the rich cultural
              heritage, breathtaking landscapes, and authentic experiences of
              East Hararghe Zone.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/packages" className="btn-primary btn-lg group">
                <Mountain className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Explore Packages
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="btn-outline btn-lg text-white border-white/30 hover:bg-white/10"
              >
                <Users className="h-5 w-5 mr-2" />
                Join Our Community
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">500+</div>
                <div className="text-white/70 text-sm">Happy Travelers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">50+</div>
                <div className="text-white/70 text-sm">Tour Packages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">15+</div>
                <div className="text-white/70 text-sm">Destinations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">4.9</div>
                <div className="text-white/70 text-sm">Average Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-gradient shadow-2xl p-8 -mt-32 relative z-10 animate-slide-up">
            <h3 className="text-2xl font-bold text-center mb-8 text-slate-800">
              Find Your Perfect Adventure
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="form-group">
                <label className="form-label">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Destination
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Where would you like to go?"
                    className="input pl-4"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Check-in Date
                </label>
                <input type="date" className="input" />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Users className="inline h-4 w-4 mr-1" />
                  Duration
                </label>
                <select className="input">
                  <option>Any duration</option>
                  <option>1-3 days</option>
                  <option>4-7 days</option>
                  <option>1-2 weeks</option>
                  <option>2+ weeks</option>
                </select>
              </div>
              <div className="flex items-end">
                <Link to="/packages" className="btn-primary w-full btn-lg">
                  <Search className="h-5 w-5 mr-2" />
                  Search Tours
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gradient-primary mb-6">
              Why Choose East Hararghe Tours?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Experience authentic Ethiopian culture and natural beauty in the
              heart of East Hararghe Zone with our expertly crafted tours and
              local insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group hover-lift">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Coffee className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Cultural Heritage
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Immerse yourself in authentic Oromo culture, traditional coffee
                ceremonies, and local customs.
              </p>
            </div>

            <div className="text-center group hover-lift">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Local Expertise
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Travel with knowledgeable local guides who share the stories and
                secrets of East Hararghe.
              </p>
            </div>

            <div className="text-center group hover-lift">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Mountain className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Natural Wonders
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Explore stunning landscapes, from highland coffee farms to the
                famous Babille Elephant Sanctuary.
              </p>
            </div>

            <div className="text-center group hover-lift">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Easy Booking
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Simple and secure booking process with instant confirmation and
                24/7 customer support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gradient-secondary mb-6">
              Featured Tour Packages
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Discover our most popular and highly-rated travel experiences
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-64 bg-slate-300 rounded-t-2xl"></div>
                  <div className="card-content">
                    <div className="h-6 bg-slate-300 rounded mb-3"></div>
                    <div className="h-4 bg-slate-300 rounded w-2/3 mb-4"></div>
                    <div className="h-4 bg-slate-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPackages.map((pkg, index) => (
                <Link
                  key={pkg.id}
                  to={`/packages/${pkg.id}`}
                  className="card hover-lift hover-glow group animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-64 bg-gradient-to-br from-slate-200 to-slate-300 rounded-t-2xl overflow-hidden">
                    {pkg.images && pkg.images.length > 0 ? (
                      <img
                        src={getImageUrl(pkg.images[0])}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center">
                        <Camera className="h-16 w-16 text-white/80" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full text-sm font-bold text-slate-800 shadow-lg">
                      {pkg.price} ETB
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center text-white/90 text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{pkg.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-content">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {pkg.title}
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(pkg.average_rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-600 ml-2">
                          {pkg.average_rating.toFixed(1)} ({pkg.review_count})
                        </span>
                      </div>
                      <div className="badge-primary">
                        {pkg.duration_days} days
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        Starting from
                      </span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">
                          {pkg.price} ETB
                        </div>
                        <div className="text-sm text-slate-500">per person</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/packages"
              className="btn-primary btn-lg inline-flex items-center group"
            >
              View All Packages
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
              Join thousands of travelers who have discovered the magic of East
              Hararghe with our expertly crafted tours and unforgettable
              experiences.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/register"
                className="btn btn-lg bg-white text-blue-600 hover:bg-slate-100 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <Users className="h-5 w-5 mr-2" />
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/packages"
                className="btn btn-lg bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                <Mountain className="h-5 w-5 mr-2" />
                Browse Tours
              </Link>
            </div>

            <div className="mt-12 text-center">
              <p className="text-white/80 text-sm">
                ✨ No booking fees • 🛡️ Secure payments • 📞 24/7 support
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
