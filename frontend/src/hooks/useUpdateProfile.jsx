import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const UpdateProfile = () => {
    const queryClient = useQueryClient()

    const { mutateAsync: updateProfile, isPending: isUpadatingProfile } = useMutation({
        mutationFn: async (formdata) => {
          try {
            const res = await fetch("/api/users/update", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formdata),
            });
            const data = await res.json();
    
            if (!res.ok) {
              throw new Error(data.error);
            }
    
            return data;
          } catch (error) {
            throw new Error(error.message);
          }
        },
    
        onSuccess: () => {
          toast.success("Profile updated successfully");
          Promise.all([
            queryClient.invalidateQueries({ queryKey: ["authUser"] }),
            queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
            queryClient.invalidateQueries({ queryKey: ["posts"] }),

          ]);
          
        },
    
        onError: (error) => {
          toast.error(error.message);
        },
      });

      return {updateProfile, isUpadatingProfile}
}

export default UpdateProfile