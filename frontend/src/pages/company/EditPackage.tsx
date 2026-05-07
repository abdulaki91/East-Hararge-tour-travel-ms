import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { packageService } from "../../services/packages";
import { type PackageFormData } from "../../types";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { getErrorMessage } from "../../utils/errorHandler";

const itineraryItemSchema = z.object({
  day: z.number().min(1),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  activities: z.array(z.string()).optional(),
});

const packageSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  duration_days: z.number().min(1, "Duration must be at least 1 day"),
  price: z.number().min(1, "Price must be greater than 0"),
  max_people: z.number().min(1, "Max people must be at least 1"),
  available_slots: z.number().min(0, "Available slots cannot be negative"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  includes: z.string().optional(),
  excludes: z.string().optional(),
  itinerary: z
    .array(itineraryItemSchema)
    .min(1, "At least one itinerary item is required"),
});

type EditPackageFormData = z.infer<typeof packageSchema>;

const EditPackage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Fetch package data
  const { data: packageData, isLoading: isLoadingPackage } = useQuery({
    queryKey: ["package", id],
    queryFn: () => packageService.getPackage(Number(id)),
    enabled: !!id,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      itinerary: [{ day: 1, title: "", description: "", activities: [] }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itinerary",
  });

  // Populate form with existing data
  useEffect(() => {
    if (packageData?.data) {
      const pkg = packageData.data;
      reset({
        title: pkg.title,
        description: pkg.description,
        location: pkg.location,
        duration_days: pkg.duration_days,
        price: pkg.price,
        max_people: pkg.max_people,
        available_slots: pkg.available_slots,
        start_date: pkg.start_date?.split("T")[0] || "",
        end_date: pkg.end_date?.split("T")[0] || "",
        includes: pkg.includes || "",
        excludes: pkg.excludes || "",
        itinerary:
          pkg.itinerary && pkg.itinerary.length > 0
            ? pkg.itinerary
            : [{ day: 1, title: "", description: "", activities: [] }],
      });

      if (pkg.images && pkg.images.length > 0) {
        setExistingImages(pkg.images);
      }
    }
  }, [packageData, reset]);

  const updatePackageMutation = useMutation({
    mutationFn: (data: Partial<PackageFormData>) =>
      packageService.updatePackage(Number(id), data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Package updated successfully!");
        navigate("/company/packages");
      } else {
        toast.error(response.message || "Failed to update package");
      }
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, "Failed to update package");
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: EditPackageFormData) => {
    const formData: Partial<PackageFormData> = {
      ...data,
      images: images.length > 0 ? images : undefined,
    };
    updatePackageMutation.mutate(formData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const addItineraryDay = () => {
    append({
      day: fields.length + 1,
      title: "",
      description: "",
      activities: [],
    });
  };

  const removeItineraryDay = (index: number) => {
    remove(index);
  };

  if (isLoadingPackage) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!packageData?.data) {
    return (
      <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        <p className="text-error-600 mb-6 font-medium">Package not found</p>
        <Button onClick={() => navigate("/company/packages")}>
          Back to Packages
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/company/packages")}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Package</h1>
        </div>
        <Button variant="outline" onClick={() => navigate("/company/packages")}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Package Title"
                {...register("title")}
                error={errors.title?.message}
                placeholder="Amazing Bali Adventure"
              />
            </div>

            <Input
              label="Location"
              {...register("location")}
              error={errors.location?.message}
              placeholder="Bali, Indonesia"
            />

            <Input
              label="Duration (Days)"
              type="number"
              {...register("duration_days", { valueAsNumber: true })}
              error={errors.duration_days?.message}
              min={1}
            />

            <Input
              label="Price per Person (ETB)"
              type="number"
              {...register("price", { valueAsNumber: true })}
              error={errors.price?.message}
              min={1}
              step="0.01"
            />

            <Input
              label="Maximum People"
              type="number"
              {...register("max_people", { valueAsNumber: true })}
              error={errors.max_people?.message}
              min={1}
            />

            <Input
              label="Available Slots"
              type="number"
              {...register("available_slots", { valueAsNumber: true })}
              error={errors.available_slots?.message}
              min={0}
              placeholder="Number of available slots"
            />

            <Input
              label="Start Date"
              type="date"
              {...register("start_date")}
              error={errors.start_date?.message}
            />

            <Input
              label="End Date"
              type="date"
              {...register("end_date")}
              error={errors.end_date?.message}
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Describe your amazing package..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Images</h2>

          {existingImages.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Images
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Package ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Upload new images to replace existing ones
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload New Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="mt-1 text-sm text-gray-500">
              Upload new images to replace the current ones
            </p>
            {images.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  {images.length} new image(s) selected
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Includes/Excludes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            What's Included/Excluded
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What's Included
              </label>
              <textarea
                {...register("includes")}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Accommodation&#10;Meals&#10;Transportation&#10;Guide"
              />
              <p className="mt-1 text-sm text-gray-500">
                List each item on a new line
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What's Not Included
              </label>
              <textarea
                {...register("excludes")}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="International flights&#10;Travel insurance&#10;Personal expenses&#10;Tips"
              />
              <p className="mt-1 text-sm text-gray-500">
                List each item on a new line
              </p>
            </div>
          </div>
        </div>

        {/* Itinerary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Itinerary</h2>
            <Button type="button" onClick={addItineraryDay} size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Day
            </Button>
          </div>

          <div className="space-y-6">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Day {index + 1}
                  </h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItineraryDay(index)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Day Title"
                    {...register(`itinerary.${index}.title`)}
                    error={errors.itinerary?.[index]?.title?.message}
                    placeholder="Arrival & City Tour"
                  />

                  <Input
                    label="Day Number"
                    type="number"
                    {...register(`itinerary.${index}.day`, {
                      valueAsNumber: true,
                    })}
                    error={errors.itinerary?.[index]?.day?.message}
                    min={1}
                    value={index + 1}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register(`itinerary.${index}.description`)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Describe what happens on this day..."
                  />
                  {errors.itinerary?.[index]?.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.itinerary[index]?.description?.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {errors.itinerary && (
            <p className="mt-2 text-sm text-red-600">
              {errors.itinerary.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/company/packages")}
          >
            Cancel
          </Button>
          <Button type="submit" loading={updatePackageMutation.isPending}>
            Update Package
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditPackage;
