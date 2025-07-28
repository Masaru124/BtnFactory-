const validRoles = ["admin", "staff", "user"];
const validDepartments = [
  "Raw Material",
  "Casting",
  "Turning",
  "Polish",
  "Packing",
];

function validateRoles(roles) {
  return Array.isArray(roles) && roles.every((r) => validRoles.includes(r));
}

function validateDepartments(departments) {
  return (
    Array.isArray(departments) &&
    departments.every((d) => validDepartments.includes(d))
  );
}

module.exports = {
  validateRoles,
  validateDepartments,
};
