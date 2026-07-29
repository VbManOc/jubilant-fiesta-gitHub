document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  async function renderActivities(activities) {
    activitiesList.innerHTML = "";
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

    Object.entries(activities).forEach(([name, details]) => {
      const activityCard = document.createElement("div");
      activityCard.className = "activity-card";

      const spotsLeft = details.max_participants - details.participants.length;
      const participants = Array.isArray(details.participants) ? details.participants : [];
      const participantItems =
        participants.length > 0
          ? participants
              .map(
                (participant) => `
                  <div class="participant-pill">
                    <span>${participant}</span>
                    <button
                      type="button"
                      class="participant-remove-btn"
                      data-activity="${name}"
                      data-email="${participant}"
                      aria-label="Remove ${participant} from ${name}"
                    >
                      <span aria-hidden="true">✕</span>
                    </button>
                  </div>
                `
              )
              .join("")
          : "<div class='participant-pill empty'>No participants yet</div>";

      activityCard.innerHTML = `
        <div class="activity-card__header">
          <h4>${name}</h4>
          <span class="availability-pill">${spotsLeft} spots left</span>
        </div>
        <p class="activity-description">${details.description}</p>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <div class="participants-section">
          <div class="participants-section__title">Participants</div>
          <div class="participants-list">${participantItems}</div>
        </div>
      `;

      activitiesList.appendChild(activityCard);

      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });

    activitiesList.querySelectorAll(".participant-remove-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const activityName = button.dataset.activity;
        const participantEmail = button.dataset.email;

        try {
          const response = await fetch(
            `/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(participantEmail)}`,
            {
              method: "POST",
            }
          );

          const result = await response.json();

          if (response.ok) {
            messageDiv.textContent = result.message;
            messageDiv.className = "success";
            await fetchActivities();
          } else {
            messageDiv.textContent = result.detail || "An error occurred";
            messageDiv.className = "error";
          }

          messageDiv.classList.remove("hidden");
          setTimeout(() => {
            messageDiv.classList.add("hidden");
          }, 5000);
        } catch (error) {
          messageDiv.textContent = "Failed to unregister. Please try again.";
          messageDiv.className = "error";
          messageDiv.classList.remove("hidden");
          console.error("Error unregistering participant:", error);
        }
      });
    });
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();
      await renderActivities(activities);
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
