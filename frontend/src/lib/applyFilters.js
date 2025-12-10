// export default function applyFilters(rows, f) {
//   const inMulti = (filterArr, valueArrOrVal) => {
//     if (!filterArr || filterArr.length === 0) return true;
//     const vals = Array.isArray(valueArrOrVal) ? valueArrOrVal : [valueArrOrVal];
//     return filterArr.some(x => vals.includes(x));
//   };

//   const inRange = (range, v) => {
//     if (!range || v == null) return true;
//     const [min, max] = range;
//     return v >= min && v <= max;
//   };

//   const inBool = (filterVal, vBool) => {
//     if (!filterVal) return true;
//     return filterVal === "YES" ? vBool === true : vBool === false;
//   };

//   return rows.filter(r => (
//     inMulti(f.softwareType, r.softwareType) &&
//     inMulti(f.expectedInput, r.expectedInput) &&
//     inMulti(f.generatedOutput, r.generatedOutput) &&
//     inMulti(f.modelType, r.modelType) &&
//     inMulti(f.foundationalModel, r.foundationalModel) &&
//     inMulti(f.inferenceLocation, r.inferenceLocation) &&
//     inBool(f.hasApi, r.hasApi) &&
//     inRange(f.toolLaunchYear, r.yearLaunched) &&
//     inMulti(f.toolName, r.toolName) &&
//     inMulti(f.tasks, r.tasks) &&

//     inMulti(f.parentOrg, r.parentOrg) &&
//     inMulti(f.orgMaturity, r.orgMaturity) &&
//     inMulti(f.fundingType, r.fundingType) &&
//     inMulti(f.businessModel, r.businessModel) &&
//     inMulti(f.ipCreationPotential, r.ipCreationPotential) &&
//     inRange(f.yearCompanyFounded, r.yearCompanyFounded) &&
//     inBool(f.legalCasePending, r.legalCasePending)
//   ));
// }


export default function applyFilters(rows, f) {
  const inMulti = (filterArr, valueArrOrVal) => {
    if (!filterArr || filterArr.length === 0) return true;
    const vals = Array.isArray(valueArrOrVal) ? valueArrOrVal : [valueArrOrVal];
    return filterArr.some(x => vals.includes(x));
  };

  const inRange = (range, v) => {
    if (!range || v == null) return true;
    const [min, max] = range;
    return v >= min && v <= max;
  };

  const inBool = (filterVal, vBool) => {
    if (!filterVal) return true;
    return filterVal === "YES" ? vBool === true : vBool === false;
  };

  // ✅ NORMALIZERS (match ToolsTable precedence)
  const getHasApiBool = (r) => {
    const raw = String(r?._raw?.HAS_API || r?._raw?.has_api || "")
      .trim()
      .toUpperCase();
    if (raw) return raw === "YES";
    if (typeof r?.hasApi === "boolean") return r.hasApi;
    return false;
  };

  const getLegalCaseBool = (r) => {
    const raw = String(r?._raw?.LEGAL_CASE_PENDING || r?._raw?.legal_case_pending || "")
      .trim()
      .toUpperCase();
    if (raw) return raw === "YES";
    if (typeof r?.legalCasePending === "boolean") return r.legalCasePending;
    return false;
  };

  return rows.filter(r => (
    // tech
    inMulti(f.softwareType, r.softwareType) &&
    inMulti(f.expectedInput, r.expectedInput) &&
    inMulti(f.generatedOutput, r.generatedOutput) &&
    inMulti(f.modelType, r.modelType) &&
    inMulti(f.foundationalModel, r.foundationalModel) &&
    inMulti(f.inferenceLocation, r.inferenceLocation) &&
    inBool(f.hasApi, getHasApiBool(r)) &&
    inRange(f.yearLaunchedRange, r.yearLaunched) &&
    inMulti(f.toolName, r.toolName) &&
    inMulti(f.tasks, r.tasks) &&

    // business
    inMulti(f.parentOrg, r.parentOrg) &&
    inMulti(f.orgMaturity, r.orgMaturity) &&
    inMulti(f.fundingType, r.fundingType) &&
    inMulti(f.businessModel, r.businessModel) &&
    inMulti(f.ipCreationPotential, r.ipCreationPotential) &&
    inRange(f.yearCompanyFoundedRange, r.yearCompanyFounded) &&
    inBool(f.legalCasePending, getLegalCaseBool(r))
  ));
}

