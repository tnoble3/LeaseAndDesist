import { useEffect } from "react";
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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      goalId: selectedGoalId || "none",
    },
  });

  const onSubmit = async (values) => {
    const normalizedGoalId =
      values.goalId && values.goalId !== "none" ? values.goalId : undefined;
    const payload = {
      ...values,
      goalId: normalizedGoalId,
    };
    if (!normalizedGoalId) {
      delete payload.goalId;
    }

    await createChallenge(payload);
    reset({ title: "", description: "", goalId: values.goalId || "none" });
    onCreated?.(normalizedGoalId ?? null);
  };

  useEffect(() => {
    if (!showGoalSelect) return;
    setValue("goalId", selectedGoalId || "none");
  }, [selectedGoalId, setValue, showGoalSelect]);

  const disableForm = isDisabled;

  return (
    <section className="card form-card">
      <h3>Create An Event</h3>
      <form className="goal-form" onSubmit={handleSubmit(onSubmit)}>
        {showGoalSelect && (
          <label>
            Goal
            <select
              {...register("goalId")}
              disabled={disableForm}
              defaultValue={selectedGoalId || "none"}
            >
              <option value="none">No goal (independent event)</option>
              {goals.length > 0 && <option value="">Select a goal</option>}
              {goals.map((goal) => (
                <option key={goal._id} value={goal._id}>
                  {goal.title}
                </option>
              ))}
            </select>
            {errors.goalId && <span className="error">{errors.goalId.message}</span>}
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
