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

  return rows.filter(r => (
    inMulti(f.softwareType, r.softwareType) &&
    inMulti(f.expectedInput, r.expectedInput) &&
    inMulti(f.generatedOutput, r.generatedOutput) &&
    inMulti(f.modelType, r.modelType) &&
    inMulti(f.foundationalModel, r.foundationalModel) &&
    inMulti(f.inferenceLocation, r.inferenceLocation) &&
    inBool(f.hasApi, r.hasApi) &&
    inRange(f.toolLaunchYear, r.yearLaunched) &&
    inMulti(f.toolName, r.toolName) &&
    inMulti(f.tasks, r.tasks) &&

    inMulti(f.parentOrg, r.parentOrg) &&
    inMulti(f.orgMaturity, r.orgMaturity) &&
    inMulti(f.fundingType, r.fundingType) &&
    inMulti(f.businessModel, r.businessModel) &&
    inMulti(f.ipCreationPotential, r.ipCreationPotential) &&
    inRange(f.yearCompanyFounded, r.yearCompanyFounded) &&
    inBool(f.legalCasePending, r.legalCasePending)
  ));
}
