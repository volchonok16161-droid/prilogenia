// Presentation-only checklist workflow summary. Never infer an event from the percentage.
// Unknown / legacy metadata stays explicitly unverified.
export function buildChecklistWorkflowView(row) {
  const stats = row?.stats && typeof row.stats === "object" && !Array.isArray(row.stats) ? row.stats : {};
  const workflow = row?.workflow && typeof row.workflow === "object" && !Array.isArray(row.workflow) ? row.workflow : {};
  const pct = Number(stats.completionPercent);
  const percentage = Number.isFinite(pct) ? Math.max(0, Math.min(100, Math.floor(pct))) : null;
  const total = Number(stats.totalFields ?? stats.total);
  const filled = Number(stats.filledTotal ?? stats.answered);
  const counted = Number.isSafeInteger(total) && total > 0 && Number.isSafeInteger(filled) && filled >= 0 && filled <= total;
  const selected = Number(workflow.selection?.selectedEquipment);
  const available = Number(workflow.selection?.availableEquipment);
  const validSelection = Number.isSafeInteger(selected) && selected >= 0 && Number.isSafeInteger(available) && available >= selected && available > 0;
  const selectedOps = Number(workflow.selection?.selectedOperations);
  const availableOps = Number(workflow.selection?.availableOperations);
  const validOperations = Number.isSafeInteger(selectedOps) && selectedOps >= 0 &&
    Number.isSafeInteger(availableOps) && availableOps >= selectedOps && availableOps > 0;
  const sections = Number(workflow.selection?.selectedSections);
  const totalSections = Number(workflow.selection?.availableSections);
  const validSections = Number.isSafeInteger(sections) && sections >= 0 && Number.isSafeInteger(totalSections) && totalSections >= sections && totalSections > 0;
  const notice = workflow.notifications;
  const required = Number(notice?.required);
  const sent = Number(notice?.delivered);
  const notSent = Number(notice?.notDelivered);
  const pending = Number(notice?.pending);
  const invalid = Number(notice?.missingEvidence);
  const validNotices = notice && [required,sent,notSent,pending,invalid].every(x => Number.isSafeInteger(x) && x >= 0) && sent + notSent + pending === required;
  const date = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v)) ? v : null;
  const excel = date(workflow.excel?.requestedAt);
  const actPrepared = date(workflow.act?.preparedAt);
  // Only show 'uploaded' if the backend explicitly reports verified persistence.
  const actUploaded = workflow.act?.verifiedUpload === true ? date(workflow.act?.uploadedAt) : null;
  return Object.freeze({
    percentage, counted, total: counted ? total : null, filled: counted ? filled : null,
    equipment: validSelection ? {selected,available} : null,
    operations: validOperations ? {selected:selectedOps,available:availableOps} : null,
    sections: validSections ? {selected:sections,available:totalSections} : null,
    excelRequestedAt:excel, actPreparedAt:actPrepared, actUploadedAt:actUploaded,
    notifications:validNotices ? {required,sent,notSent,pending,missingEvidence:invalid} : null
  });
}
