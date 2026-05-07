import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  CameraIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { packageService } from "../services/packages";
import { reviewService } from "../services/reviews";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Rating from "../components/ui/Rating";
import Modal from "../components/ui/Modal";
import BookingForm from "../components/BookingForm";
import { getImageUrl } from "../utils/imageUrl";

const PackageDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: packageData, isLoading: packageLoading } = useQuery({
    queryKey: ["package", id],
    queryFn: () => packageService.getPackage(Number(id)),
    enabled: !!id,
  });

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["package-reviews", id],
    queryFn: () => reviewService.getPackageReviews(Number(id), { limit: 5 }),
    enabled: !!id,
  });

  if (packageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center">
              <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading package details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!packageData?.success || !packageData.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <XMarkIcon className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Package Not Found
            </h1>
            <p className="text-slate-600 mb-8">
              The package you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/packages")} variant="primary">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Packages
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const pkg = packageData.data;
  const reviews = reviewsData?.data.items || [];

  const isExpired = new Date(pkg.end_date) < new Date();

  const handleBookNow = () => {
    if (isExpired) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setShowBookingModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative">
        {pkg.images && pkg.images.length > 0 ? (
          <div className="relative h-96 md:h-[500px] overflow-hidden">
            <img
              src={getImageUrl(pkg.images[selectedImageIndex])}
              alt={pkg.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

            {/* Navigation */}
            <div className="absolute top-6 left-6">
              <button
                onClick={() => navigate("/packages")}
                className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all duration-200"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Packages
              </button>
            </div>

            {/* Actions */}
            <div className="absolute top-6 right-6 flex space-x-2">
              <button className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200">
                <HeartIcon className="h-5 w-5" />
              </button>
              <button className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200">
                <ShareIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Package Info Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="text-white">
                  <div className="flex items-center mb-2">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span className="text-white/90">{pkg.location}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {pkg.title}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(pkg.average_rating)
                                ? "text-yellow-400 fill-current"
                                : "text-white/40"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-white/90">
                        {pkg.average_rating.toFixed(1)} ({pkg.review_count}{" "}
                        reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {pkg.price} ETB
                  </div>
                  <div className="text-white/80">per person</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center">
            <CameraIcon className="h-24 w-24 text-white/60" />
          </div>
        )}

        {/* Image Gallery Thumbnails */}
        {pkg.images && pkg.images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2">
              {pkg.images.slice(0, 5).map((image, index) => (
                <button
                  key={index}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIndex === index
                      ? "border-white shadow-lg scale-110"
                      : "border-white/50 hover:border-white/80"
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`${pkg.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <div className="card animate-fade-in">
              <div className="card-content">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  About This Experience
                </h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {pkg.description}
                </p>
              </div>
            </div>

            {/* Package Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
              <div className="card hover-lift">
                <div className="card-content">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6">
                    Package Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <ClockIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {pkg.duration_days} days
                        </div>
                        <div className="text-sm text-slate-500">Duration</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                        <UserGroupIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          Max {pkg.max_people} people
                        </div>
                        <div className="text-sm text-slate-500">Group size</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                        <CalendarIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {new Date(pkg.start_date).toLocaleDateString()} -{" "}
                          {new Date(pkg.end_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-slate-500">
                          Available dates
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card hover-lift">
                <div className="card-content">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6">
                    Availability & Company
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-600">Available Slots</span>
                        <span
                          className={`font-bold ${pkg.available_slots > 5 ? "text-green-600" : pkg.available_slots > 0 ? "text-orange-600" : "text-red-600"}`}
                        >
                          {pkg.available_slots} remaining
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${pkg.available_slots > 5 ? "bg-green-500" : pkg.available_slots > 0 ? "bg-orange-500" : "bg-red-500"}`}
                          style={{
                            width: `${Math.max(10, (pkg.available_slots / pkg.max_people) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-200">
                      <div className="text-sm text-slate-500 mb-1">
                        Organized by
                      </div>
                      <div className="font-semibold text-slate-900">
                        {pkg.company_name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Includes/Excludes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
              {pkg.includes && (
                <div className="card hover-lift">
                  <div className="card-content">
                    <h3 className="text-xl font-semibold text-slate-900 mb-6">
                      What's Included
                    </h3>
                    <div className="space-y-3">
                      {pkg.includes.split("\n").map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <CheckIcon className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="text-slate-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {pkg.excludes && (
                <div className="card hover-lift">
                  <div className="card-content">
                    <h3 className="text-xl font-semibold text-slate-900 mb-6">
                      What's Not Included
                    </h3>
                    <div className="space-y-3">
                      {pkg.excludes.split("\n").map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <XMarkIcon className="h-3 w-3 text-red-600" />
                          </div>
                          <span className="text-slate-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Itinerary */}
            {pkg.itinerary && pkg.itinerary.length > 0 && (
              <div className="card animate-slide-up">
                <div className="card-content">
                  <h2 className="text-2xl font-bold text-slate-900 mb-8">
                    Day by Day Itinerary
                  </h2>
                  <div className="space-y-8">
                    {pkg.itinerary.map((day, index) => (
                      <div key={index} className="relative">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                            {day.day}
                          </div>
                          <div className="ml-6 flex-1">
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">
                              {day.title}
                            </h3>
                            <p className="text-slate-600 mb-4 leading-relaxed">
                              {day.description}
                            </p>
                            {day.activities && day.activities.length > 0 && (
                              <div className="bg-slate-50 rounded-xl p-4">
                                <h4 className="font-medium text-slate-900 mb-2">
                                  Activities:
                                </h4>
                                <ul className="space-y-1">
                                  {day.activities.map((activity, actIndex) => (
                                    <li
                                      key={actIndex}
                                      className="text-sm text-slate-600 flex items-center"
                                    >
                                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                                      {activity}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        {index < pkg.itinerary.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-8 bg-gradient-to-b from-blue-200 to-purple-200"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card animate-slide-up">
              <div className="card-content">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">
                  Reviews & Ratings
                </h2>
                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-slate-50 rounded-2xl p-6 hover-lift"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold">
                              {review.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="font-semibold text-slate-900">
                                {review.user_name}
                              </div>
                              <div className="text-sm text-slate-500">
                                {new Date(
                                  review.created_at,
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-slate-600 leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <StarIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500">
                      No reviews yet. Be the first to review this package!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-gradient shadow-2xl sticky top-8 animate-slide-in-right">
              <div className="card-content">
                <div className="text-center mb-8">
                  <div className="text-4xl font-bold text-gradient-primary mb-2">
                    {pkg.price} ETB
                  </div>
                  <div className="text-slate-500">per person</div>
                </div>

                {isExpired && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center text-red-800 font-semibold mb-1">
                      <XMarkIcon className="h-5 w-5 mr-2" />
                      Tour Expired
                    </div>
                    <p className="text-sm text-red-600">
                      This tour's availability has ended. Please check our other
                      upcoming tours.
                    </p>
                  </div>
                )}

                <Button
                  fullWidth
                  size="lg"
                  onClick={handleBookNow}
                  disabled={pkg.available_slots === 0 || isExpired}
                  variant={
                    pkg.available_slots === 0 || isExpired
                      ? "outline"
                      : "primary"
                  }
                  className="mb-6"
                >
                  {isExpired
                    ? "Tour Expired"
                    : pkg.available_slots === 0
                      ? "Fully Booked"
                      : "Book This Experience"}
                </Button>

                <div className="text-center text-sm text-slate-500 mb-6 flex items-center justify-center">
                  <CheckIcon className="h-4 w-4 mr-1 text-green-500" />
                  Free cancellation up to 24 hours before
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-200/50">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Duration:</span>
                    <span className="font-semibold text-slate-900">
                      {pkg.duration_days} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Max Group Size:</span>
                    <span className="font-semibold text-slate-900">
                      {pkg.max_people} people
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Available Slots:</span>
                    <span
                      className={`font-semibold ${pkg.available_slots > 5 ? "text-green-600" : pkg.available_slots > 0 ? "text-orange-600" : "text-red-600"}`}
                    >
                      {pkg.available_slots}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Rating:</span>
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-semibold text-slate-900">
                        {pkg.average_rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200/50">
                  <div className="text-center text-xs text-slate-500">
                    🛡️ Secure booking • 📞 24/7 support • ⭐ Verified reviews
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Book This Experience"
        size="lg"
      >
        <BookingForm
          package={pkg}
          onSuccess={() => {
            setShowBookingModal(false);
            navigate("/user/bookings");
          }}
          onCancel={() => setShowBookingModal(false)}
        />
      </Modal>
    </div>
  );
};

export default PackageDetailsPage;
