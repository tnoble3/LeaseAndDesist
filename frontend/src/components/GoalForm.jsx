import { useForm } from "react-hook-form";
import { createGoal } from "../api/goalService.js";

const GoalForm = ({ onCreated }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      targetDate: "",
    },
  });

  const onSubmit = async (values) => {
    await createGoal(values);
    reset();
    onCreated?.();
  };

  return (
    <section className="card form-card">
      <h3>Create a goal</h3>
      <form className="goal-form" onSubmit={handleSubmit(onSubmit)}>
        <label>
          Title<span className="required">*</span>
          <input
            type="text"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && <span className="error">{errors.title.message}</span>}
        </label>
        <label>
          Description
          <textarea rows="3" {...register("description")} />
        </label>
        <label>
          Target date
          <input type="date" {...register("targetDate")} />
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save goal"}
        </button>
      </form>
    </section>
  );
};

export default GoalForm;
