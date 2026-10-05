/**
 * AI Service — Secure Server-Side Proxy
 *
 * The Gemini API key is NEVER exposed in the browser.
 * All AI analysis is routed through a Firebase Cloud Function
 * or a backend endpoint defined by VITE_AI_ENDPOINT.
 *
 * The fallback rule-based engine is used ONLY when the server
 * endpoint is unavailable, ensuring the complaint is still stored.
 */

// Server-side AI endpoint (Firebase Cloud Function or Express server)
const AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT || '';

/**
 * Analyze a complaint using the secure server-side AI endpoint
 * Falls back to rule-based engine if server is unavailable
 */
export async function analyzeComplaintWithAI(complaintData, existingComplaints = []) {
  const { title = '', description = '', building = '', room = '', floor = '', category: userCat = '', imageUrls = [] } = complaintData;

  // Step 1: Local duplicate check
  const duplicateResult = checkDuplicateComplaints(complaintData, existingComplaints);

  // Step 2: Try server-side AI endpoint
  if (AI_ENDPOINT) {
    try {
      const response = await fetch(`${AI_ENDPOINT}/analyze-complaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          building,
          floor,
          room,
          category: userCat,
          imageUrls,
          existingComplaints: existingComplaints.slice(0, 20).map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            category: c.category || c.aiCategory,
            building: c.building,
            floor: c.floor,
            room: c.room,
            status: c.status
          }))
        })
      });

      if (response.ok) {
        const aiResult = await response.json();

        // Validate required fields
        if (aiResult.category && aiResult.priority) {
          return {
            aiCategory: aiResult.category,
            aiPriority: normalizeEnum(aiResult.priority, ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], 'MEDIUM'),
            safetyRisk: normalizeEnum(aiResult.safetyRisk, ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], 'MEDIUM'),
            recommendedTeam: aiResult.recommendedTeam || 'Infrastructure',
            priorityReason: aiResult.reason || '',
            suggestedAction: aiResult.suggestedAction || '',
            aiVisualObservations: aiResult.visualObservation || '',
            aiDuplicateMatch: aiResult.duplicateMatch || (duplicateResult.match ? duplicateResult.match.id : null),
            aiDuplicateConfidence: aiResult.duplicateConfidence || duplicateResult.confidence,
            aiStatus: 'SUCCESS'
          };
        }
      } else {
        const errText = await response.text();
        console.warn("AI endpoint returned error:", response.status, errText);
      }
    } catch (err) {
      console.warn("AI server request failed, using rule-based fallback:", err.message);
    }
  }

  // Step 3: Rule-based fallback — complaint is still saved with aiStatus = 'FALLBACK'
  const ruleResult = runSmartRuleAIEngine(complaintData, duplicateResult);
  return { ...ruleResult, aiStatus: AI_ENDPOINT ? 'FALLBACK' : 'LOCAL' };
}

/**
 * Normalize an enum value to allowed set
 */
function normalizeEnum(value, allowed, defaultVal) {
  if (!value) return defaultVal;
  const upper = String(value).toUpperCase();
  return allowed.includes(upper) ? upper : defaultVal;
}

/**
 * Local duplicate complaint detection
 */
function checkDuplicateComplaints(newComplaint, existingComplaints = []) {
  if (!existingComplaints || existingComplaints.length === 0) {
    return { match: null, confidence: 0 };
  }

  const newLoc = `${newComplaint.building || ''} ${newComplaint.room || ''}`.toLowerCase().trim();
  const newText = `${newComplaint.title || ''} ${newComplaint.description || ''}`.toLowerCase();

  for (const existing of existingComplaints) {
    if (existing.status === 'COMPLETED') continue;

    const existLoc = `${existing.building || ''} ${existing.room || ''}`.toLowerCase().trim();
    const existText = `${existing.title || ''} ${existing.description || ''}`.toLowerCase();

    const locMatch = newLoc && existLoc && (newLoc.includes(existLoc) || existLoc.includes(newLoc));

    const keywords = ['leak', 'drip', 'fan', 'wire', 'spark', 'chair', 'table', 'wifi', 'internet',
      'toilet', 'sink', 'door', 'lock', 'light', 'ac', 'cooler', 'pipe', 'water', 'electric'];
    let sharedKeywords = 0;
    keywords.forEach(kw => {
      if (newText.includes(kw) && existText.includes(kw)) sharedKeywords++;
    });

    if (locMatch && sharedKeywords >= 1) {
      return { match: existing, confidence: 85 };
    } else if (sharedKeywords >= 2) {
      return { match: existing, confidence: 65 };
    }
  }

  return { match: null, confidence: 0 };
}

/**
 * Rule-based fallback AI engine
 */
function runSmartRuleAIEngine(complaintData, duplicateResult) {
  const { title = '', description = '', category: userCat = '' } = complaintData;
  const text = `${title} ${description} ${userCat}`.toLowerCase();

  let category = 'Other';
  let priority = 'MEDIUM';
  let safetyRisk = 'MEDIUM';
  let team = 'Infrastructure';
  let reason = '';
  let methodology = '';
  let visualNotes = 'Visual check recommended upon technician arrival.';

  if (text.includes('wire') || text.includes('spark') || text.includes('shock') || text.includes('circuit') || text.includes('short') || text.includes('electr')) {
    category = 'Electrical';
    priority = 'CRITICAL';
    safetyRisk = 'CRITICAL';
    team = 'Electrical';
    reason = 'Exposed high-voltage electrical wires or active sparking pose immediate electrocution and fire hazards.';
    methodology = '1. Disconnect circuit breaker immediately.\n2. Cordon off area.\n3. Test for residual voltage.\n4. Replace insulation & junction box.\n5. Conduct load testing.';
    visualNotes = 'Visible bare electrical wire or heat scorching observed near electrical panel.';
  } else if (text.includes('fan') || text.includes('light') || text.includes('switch') || text.includes('power') || text.includes('socket') || text.includes('plug') || text.includes('bulb')) {
    category = 'Electrical';
    priority = text.includes('fan') ? 'MEDIUM' : 'LOW';
    safetyRisk = text.includes('fan') ? 'MEDIUM' : 'LOW';
    team = 'Electrical';
    reason = 'Electrical component malfunction requires testing of capacitors, supply voltage, and mounting stability.';
    methodology = '1. Inspect power supply.\n2. Check switch wiring & capacitor.\n3. Inspect motor bearing & ceiling anchor bolts.\n4. Replace faulty part.\n5. Test unit.';
    visualNotes = 'Mounting bracket wobble or power indicator light inactive.';
  } else if (text.includes('leak') || text.includes('pipe') || text.includes('water') || text.includes('flood') || text.includes('drain') || text.includes('tap') || text.includes('sink') || text.includes('drip')) {
    category = text.includes('leak') ? 'Water Leakage' : 'Plumbing';
    priority = (text.includes('flood') || text.includes('ceiling')) ? 'HIGH' : 'MEDIUM';
    safetyRisk = (text.includes('flood') || text.includes('ceiling')) ? 'HIGH' : 'MEDIUM';
    team = 'Plumbing';
    reason = 'Water leakage risks building infrastructure damage, mold growth, and slipping hazards.';
    methodology = '1. Shut off isolation valve.\n2. Inspect pipe joint & drain traps.\n3. Replace defective washer/seal.\n4. Re-pressurize and check for drips.';
    visualNotes = 'Water accumulation on flooring or moisture patch on ceiling plaster.';
  } else if (text.includes('chair') || text.includes('table') || text.includes('desk') || text.includes('door') || text.includes('window') || text.includes('bench') || text.includes('lock') || text.includes('furniture')) {
    category = 'Furniture';
    priority = text.includes('lock') || text.includes('door') ? 'MEDIUM' : 'LOW';
    safetyRisk = 'LOW';
    team = 'Furniture/Civil';
    reason = 'Damaged furniture or door hardware impacts classroom ergonomics and access security.';
    methodology = '1. Inspect structural integrity & weld joints.\n2. Tighten hinges/screws or re-weld frame.\n3. Test load bearing capability.\n4. Apply protective finish.';
    visualNotes = 'Structural fatigue or sheared weld joint at base frame.';
  } else if (text.includes('wifi') || text.includes('internet') || text.includes('network') || text.includes('router') || text.includes('ethernet')) {
    category = 'Internet / Network';
    priority = 'MEDIUM';
    safetyRisk = 'LOW';
    team = 'IT/Network';
    reason = 'Network connection drop affects academic lab work and online exam access.';
    methodology = '1. Check patch panel link status.\n2. Verify PoE switchport status.\n3. Test ethernet jack signal.\n4. Reboot access point or replace cable.';
    visualNotes = 'Unlit activity LEDs on network outlet faceplate.';
  } else if (text.includes('clean') || text.includes('dust') || text.includes('garbage') || text.includes('trash') || text.includes('smell')) {
    category = 'Cleaning';
    priority = 'LOW';
    safetyRisk = 'LOW';
    team = 'Housekeeping';
    reason = 'Sanitation maintenance required for health standards and hygiene.';
    methodology = '1. Deploy cleaning crew with eco-disinfectants.\n2. Sanitize affected surfaces.\n3. Clear waste receptacle.\n4. Inspect room ventilation.';
    visualNotes = 'Debris or surface residue requiring deep cleaning.';
  } else {
    category = userCat || 'Infrastructure';
    priority = 'MEDIUM';
    safetyRisk = 'MEDIUM';
    team = 'Infrastructure';
    reason = 'Standard maintenance issue requires physical inspection and diagnostic evaluation.';
    methodology = '1. Conduct physical inspection.\n2. Diagnose root cause.\n3. Source repair parts.\n4. Complete repair.\n5. Test functionality.';
  }

  return {
    aiCategory: category,
    aiPriority: priority,
    safetyRisk,
    recommendedTeam: team,
    priorityReason: reason,
    suggestedAction: methodology,
    aiVisualObservations: visualNotes,
    aiDuplicateMatch: duplicateResult.match ? duplicateResult.match.id : null,
    aiDuplicateConfidence: duplicateResult.confidence
  };
}

/**
 * Generate AI Insights from real Firestore complaint data
 */
export function generateAIInsights(complaints = []) {
  if (!complaints || complaints.length === 0) {
    return [
      {
        id: 'ins-empty',
        type: 'info',
        title: 'System Ready',
        message: 'No complaints submitted yet. AI analytics will populate automatically as complaints are filed.'
      }
    ];
  }

  const total = complaints.length;
  const critical = complaints.filter(c => c.aiPriority === 'CRITICAL' && c.status !== 'COMPLETED').length;
  const completed = complaints.filter(c => c.status === 'COMPLETED').length;

  // Building hotspot
  const bldgMap = {};
  complaints.forEach(c => {
    if (c.building) bldgMap[c.building] = (bldgMap[c.building] || 0) + 1;
  });
  const maxBldg = Object.entries(bldgMap).sort((a, b) => b[1] - a[1])[0];

  // Category trend
  const catMap = {};
  complaints.forEach(c => {
    const cat = c.aiCategory || c.category || 'Other';
    catMap[cat] = (catMap[cat] || 0) + 1;
  });
  const maxCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];

  // SLA breaches: HIGH/CRITICAL not resolved in >24h
  const now = Date.now();
  const stagnant = complaints.filter(c => {
    if (c.status === 'COMPLETED') return false;
    const createdMs = c.createdAt?.toMillis ? c.createdAt.toMillis() : new Date(c.createdAt).getTime();
    return (now - createdMs) > 24 * 3600 * 1000 && (c.aiPriority === 'HIGH' || c.aiPriority === 'CRITICAL');
  });

  const insights = [];

  if (critical > 0) {
    insights.push({
      id: 'ins-critical',
      type: 'danger',
      title: 'Immediate Attention Required',
      message: `${critical} CRITICAL safety-hazard complaint${critical > 1 ? 's' : ''} currently open requiring urgent technician dispatch.`
    });
  }

  if (maxBldg && maxBldg[1] > 1) {
    insights.push({
      id: 'ins-bldg',
      type: 'warning',
      title: 'High Incident Location Cluster',
      message: `${maxBldg[0]} has the highest volume of reported issues (${maxBldg[1]} complaints). Recommend preventive inspection.`
    });
  }

  if (maxCat) {
    insights.push({
      id: 'ins-cat',
      type: 'info',
      title: 'Category Trend Analysis',
      message: `${maxCat[0]} complaints represent ${Math.round((maxCat[1] / total) * 100)}% of all maintenance requests.`
    });
  }

  if (stagnant.length > 0) {
    insights.push({
      id: 'ins-stagnant',
      type: 'warning',
      title: 'SLA Escalation Alert',
      message: `${stagnant.length} high-priority complaint${stagnant.length > 1 ? 's' : ''} exceeded the 24h SLA without resolution.`
    });
  }

  if (total > 0) {
    insights.push({
      id: 'ins-performance',
      type: 'success',
      title: 'Resolution Rate',
      message: `${Math.round((completed / total) * 100)}% of all filed complaints have been successfully resolved.`
    });
  }

  return insights;
}
