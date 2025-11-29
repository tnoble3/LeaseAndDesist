import { useForm } from "react-hook-form";
import { createChallenge } from "../api/goalService.js";

const ChallengeForm = ({
  goals = [],
  selectedGoalId,
  isDisabled,
  onCreated,
  showGoalSelect = true,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      goalId: selectedGoalId || "",
    },
  });

  const onSubmit = async (values) => {
    await createChallenge(values);
    reset({ title: "", description: "", goalId: values.goalId });
    onCreated?.(values.goalId);
  };

  const disableForm = isDisabled || !goals.length;

  return (
    <section className="card form-card">
      <h3>Add a challenge</h3>
      <form className="goal-form" onSubmit={handleSubmit(onSubmit)}>
        {showGoalSelect && (
          <label>
            Goal<span className="required">*</span>
            <select
              {...register("goalId", { required: "Select a goal" })}
              disabled={disableForm}
              defaultValue={selectedGoalId || ""}
            >
              <option value="">Select</option>
              {goals.map((goal) => (
                <option key={goal._id} value={goal._id}>
                  {goal.title}
                </option>
              ))}
            </select>
            {errors.goalId && (
              <span className="error">{errors.goalId.message}</span>
            )}
          </label>
        )}

        <label>
          Title<span className="required">*</span>
          <input
            type="text"
            {...register("title", { required: "Title is required" })}
            disabled={disableForm}
          />
          {errors.title && <span className="error">{errors.title.message}</span>}
        </label>

        <label>
          Description
          <textarea
            rows="3"
            {...register("description")}
            disabled={disableForm}
          />
        </label>

        <button type="submit" disabled={disableForm || isSubmitting}>
          {isSubmitting ? "Saving..." : "Save challenge"}
        </button>
      </form>
    </section>
  );
};

export default ChallengeForm;
