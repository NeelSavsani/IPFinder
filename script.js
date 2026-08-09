/**
 * IP Finder Application Logic (Vanilla JavaScript)
 * High-Precision IP Geolocation & 4-Step Detective VPN Inspector
 */

// DOM Elements
const knowIpBtn = document.getElementById('knowIpBtn');
const btnText = document.getElementById('btnText');
const btnIcon = document.getElementById('btnIcon');

const resultsContainer = document.getElementById('resultsContainer');
const ipv4ValueEl = document.getElementById('ipv4Value');
const ipv6ValueEl = document.getElementById('ipv6Value');
const ipv4StatusEl = document.getElementById('ipv4Status');
const ipv6StatusEl = document.getElementById('ipv6Status');

const detailLocationEl = document.getElementById('detailLocation');
const detailIspEl = document.getElementById('detailIsp');
const detailOrgEl = document.getElementById('detailOrg');
const detailTimezoneEl = document.getElementById('detailTimezone');

// Detective UI Elements
const vpnBadge = document.getElementById('vpnBadge');
const vpnBadgeText = document.getElementById('vpnBadgeText');
const asnCheckVal = document.getElementById('asnCheckVal');
const ptrCheckVal = document.getElementById('ptrCheckVal');
const webrtcCheckVal = document.getElementById('webrtcCheckVal');
const tzCheckVal = document.getElementById('tzCheckVal');
const detectiveConclusionText = document.getElementById('detectiveConclusionText');

const recheckBtn = document.getElementById('recheckBtn');
const copyAllBtn = document.getElementById('copyAllBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resultsActionsBar = document.getElementById('resultsActionsBar');

// Helper to fetch with timeout
async function fetchWithTimeout(resource, options = {}, timeoutMs = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// State Object
let state = {
  ipv4: null,
  ipv6: null,
  details: null,
  detectiveReport: null
};

// Initialize Application Events
function init() {
  knowIpBtn.addEventListener('click', handleKnowMyIp);
  recheckBtn.addEventListener('click', handleKnowMyIp);
  copyAllBtn.addEventListener('click', handleCopyFullReport);
  if (downloadBtn) {
    downloadBtn.addEventListener('click', handleDownloadReport);
  }

  // Setup individual copy buttons
  document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-copy-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl && targetEl.textContent && !targetEl.classList.contains('font-loading')) {
        copyToClipboard(targetEl.textContent, button);
      }
    });
  });
}

// Main Handler
async function handleKnowMyIp() {
  setLoadingState(true);
  
  // Reveal results container on first click
  if (resultsContainer.classList.contains('hidden')) {
    resultsContainer.classList.remove('hidden');
    resultsContainer.classList.add('visible');
    setTimeout(() => {
      resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }

  // Reset displays
  ipv4ValueEl.textContent = 'Detecting IPv4...';
  ipv4ValueEl.classList.add('font-loading');
  ipv6ValueEl.textContent = 'Detecting IPv6...';
  ipv6ValueEl.classList.add('font-loading');
  
  ipv4StatusEl.innerHTML = `<span class="dot dot-warning"></span> Fetching...`;
  ipv6StatusEl.innerHTML = `<span class="dot dot-warning"></span> Fetching...`;

  detailLocationEl.textContent = 'Loading...';
  detailIspEl.textContent = 'Loading...';
  detailOrgEl.textContent = 'Loading...';
  detailTimezoneEl.textContent = 'Loading...';

  // Reset Detective UI
  vpnBadgeText.textContent = 'Analyzing Network Signals...';
  vpnBadge.className = 'vpn-badge badge-pending';
  asnCheckVal.textContent = 'Analyzing ASN & Org...';
  asnCheckVal.className = 'detective-val font-loading';
  ptrCheckVal.textContent = 'Querying Reverse Hostname...';
  ptrCheckVal.className = 'detective-val font-loading';
  webrtcCheckVal.textContent = 'Gathering ICE Candidates...';
  webrtcCheckVal.className = 'detective-val font-loading';
  tzCheckVal.textContent = 'Comparing OS vs IP Timezone...';
  tzCheckVal.className = 'detective-val font-loading';
  detectiveConclusionText.textContent = 'Gathering detective evidence...';

  // Execute IP & Geolocation queries concurrently
  await Promise.all([
    fetchIPv4(),
    fetchIPv6()
  ]);

  // Fetch geolocation using primary resolved IP address
  const primaryIp = state.ipv4 || state.ipv6;
  if (primaryIp && primaryIp !== 'Not Available') {
    await fetchGeoDetails(primaryIp);
  } else {
    detailLocationEl.textContent = 'Unavailable';
    detailIspEl.textContent = 'Unavailable';
    detailOrgEl.textContent = 'Unavailable';
    detailTimezoneEl.textContent = 'Unavailable';
  }

  // Hide initial "Know My IP" button & reveal 3 Action Buttons in its place
  knowIpBtn.style.display = 'none';
  if (resultsActionsBar) {
    resultsActionsBar.classList.remove('hidden');
  }

  setLoadingState(false);
}

// Fetch IPv4
async function fetchIPv4() {
  try {
    const res = await fetchWithTimeout('https://api4.ipify.org?format=json', {}, 4000);
    const data = await res.json();
    if (data && data.ip) {
      state.ipv4 = data.ip;
      ipv4ValueEl.textContent = data.ip;
      ipv4ValueEl.classList.remove('font-loading');
      ipv4StatusEl.innerHTML = `<span class="dot dot-active"></span> Verified IPv4 Connection`;
      return;
    }
  } catch (err) {
    console.warn('IPv4 lookup standard endpoint failed, trying backup...', err);
  }

  // Backup IPv4 lookup
  try {
    const res = await fetchWithTimeout('https://ipv4.icanhazip.com', {}, 4000);
    const text = (await res.text()).trim();
    if (text) {
      state.ipv4 = text;
      ipv4ValueEl.textContent = text;
      ipv4ValueEl.classList.remove('font-loading');
      ipv4StatusEl.innerHTML = `<span class="dot dot-active"></span> Verified IPv4 Connection`;
      return;
    }
  } catch (err) {
    console.warn('IPv4 backup lookup failed:', err);
  }

  state.ipv4 = 'Not Available';
  ipv4ValueEl.textContent = 'Not Available';
  ipv4StatusEl.innerHTML = `<span class="dot dot-inactive"></span> IPv4 Not Detected`;
}

// Fetch IPv6
async function fetchIPv6() {
  try {
    const res = await fetchWithTimeout('https://api64.ipify.org?format=json', {}, 4000);
    const data = await res.json();
    if (data && data.ip && data.ip.includes(':')) {
      state.ipv6 = data.ip;
      ipv6ValueEl.textContent = data.ip;
      ipv6ValueEl.classList.remove('font-loading');
      ipv6StatusEl.innerHTML = `<span class="dot dot-active"></span> Verified IPv6 Connection`;
      return;
    }
  } catch (err) {
    console.warn('IPv6 lookup via api64 failed:', err);
  }

  // Backup IPv6 lookup via v6.ident.me
  try {
    const res = await fetchWithTimeout('https://v6.ident.me/.json', {}, 4000);
    const data = await res.json();
    if (data && data.address && data.address.includes(':')) {
      state.ipv6 = data.address;
      ipv6ValueEl.textContent = data.address;
      ipv6ValueEl.classList.remove('font-loading');
      ipv6StatusEl.innerHTML = `<span class="dot dot-active"></span> Verified IPv6 Connection`;
      return;
    }
  } catch (err) {
    console.warn('IPv6 backup failed:', err);
  }

  state.ipv6 = 'Not Supported / Not Detected';
  ipv6ValueEl.textContent = 'Not Supported on Network';
  ipv6StatusEl.innerHTML = `<span class="dot dot-inactive"></span> IPv6 Disabled or Unsupported`;
}

// High-Precision Geolocation & Network Details
async function fetchGeoDetails(ip) {
  let fetchedData = null;
  let ipTimezone = null;
  let orgName = '';
  let ispName = '';

  // Provider 1: ipinfo.io
  try {
    const res = await fetchWithTimeout(`https://ipinfo.io/${ip}/json`, {}, 5000);
    const data = await res.json();
    
    if (data && data.city) {
      fetchedData = data;
      state.details = data;
      
      const city = data.city || '';
      const region = data.region || '';
      const country = data.country || '';
      const locString = [city, region, country].filter(Boolean).join(', ');
      
      const mapUrl = data.loc 
        ? `https://www.google.com/maps/search/?api=1&query=${data.loc}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locString)}`;

      detailLocationEl.innerHTML = `
        <a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="location-map-link" title="Open IP location on Google Maps">
          <span>${locString}</span>
          <svg class="map-link-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      `;
      
      detailIspEl.textContent = data.org || 'Unknown';
      detailOrgEl.textContent = data.org || 'Unknown';
      detailTimezoneEl.textContent = data.timezone || 'Unknown';

      ipTimezone = data.timezone;
      orgName = data.org || '';
      ispName = data.org || '';
    }
  } catch (err) {
    console.warn('ipinfo.io precision lookup failed, trying fallback:', err);
  }

  // Provider 2: ip-api.com fallback
  if (!fetchedData) {
    try {
      const res = await fetchWithTimeout(`http://ip-api.com/json/${ip}`, {}, 5000);
      const data = await res.json();
      if (data && data.status === 'success') {
        fetchedData = data;
        const city = data.city || '';
        const region = data.regionName || '';
        const country = data.country || '';
        const locString = [city, region, country].filter(Boolean).join(', ');

        const mapUrl = (data.lat && data.lon)
          ? `https://www.google.com/maps/search/?api=1&query=${data.lat},${data.lon}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locString)}`;

        detailLocationEl.innerHTML = `
          <a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="location-map-link" title="Open IP location on Google Maps">
            <span>${locString}</span>
            <svg class="map-link-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        `;
        detailIspEl.textContent = data.isp || 'Unknown';
        detailOrgEl.textContent = data.org || data.as || 'Unknown';
        detailTimezoneEl.textContent = data.timezone || 'Unknown';

        ipTimezone = data.timezone;
        orgName = data.org || data.as || '';
        ispName = data.isp || '';
      }
    } catch (err) {
      console.warn('ip-api.com failed:', err);
    }
  }

  // Execute Detective Method Audit (4 Checks)
  await runDetectiveAudit(ip, ipTimezone, orgName, ispName);
}

// Normalize canonical timezone aliases (e.g. Asia/Calcutta == Asia/Kolkata) & compare UTC offsets
function checkTimezoneMismatch(tz1, tz2) {
  if (!tz1 || !tz2) return false;
  if (tz1 === tz2) return false;
  
  const normalize = (tz) => {
    if (tz === 'Asia/Calcutta') return 'Asia/Kolkata';
    if (tz === 'Asia/Saigon') return 'Asia/Ho_Chi_Minh';
    if (tz === 'Europe/Belfast') return 'Europe/London';
    return tz;
  };

  if (normalize(tz1) === normalize(tz2)) return false;

  try {
    const now = new Date();
    const str1 = new Date(now.toLocaleString('en-US', { timeZone: tz1 })).getTime();
    const str2 = new Date(now.toLocaleString('en-US', { timeZone: tz2 })).getTime();
    return str1 !== str2;
  } catch (e) {
    return false;
  }
}

// 🔎 Client-Side WebRTC Leak Test
function performWebRtcLeakTest(publicIp) {
  return new Promise((resolve) => {
    const candidateIps = new Set();
    let pc = null;
    let isTimedOut = false;

    const cleanup = () => {
      if (pc) {
        try { pc.close(); } catch(e) {}
      }
    };

    const timer = setTimeout(() => {
      isTimedOut = true;
      cleanup();
      resolve({ leakedIps: Array.from(candidateIps), hasLeak: candidateIps.size > 0 });
    }, 2000);

    try {
      pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      pc.createDataChannel('detective_test');
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(() => {});

      pc.onicecandidate = (event) => {
        if (isTimedOut) return;
        if (!event || !event.candidate || !event.candidate.candidate) return;
        
        const candidateStr = event.candidate.candidate;
        // Match IPv4 addresses
        const match = candidateStr.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
        if (match && match[1]) {
          const ip = match[1];
          // Exclude mdns .local & dummy addresses
          if (ip !== '0.0.0.0' && !ip.startsWith('127.')) {
            candidateIps.add(ip);
          }
        }
      };
    } catch (e) {
      clearTimeout(timer);
      cleanup();
      resolve({ leakedIps: [], hasLeak: false });
    }
  });
}

// 🔎 Reverse DNS (PTR) Lookup via Google DNS over HTTPS
async function performPtrLookup(ip) {
  if (!ip || ip.includes(':')) return 'IPv6 PTR Lookup Unsupported'; // IPv6 PTR skip for simplicity
  try {
    const reversed = ip.split('.').reverse().join('.');
    const res = await fetchWithTimeout(`https://dns.google/resolve?name=${reversed}.in-addr.arpa&type=PTR`, {}, 3500);
    const data = await res.json();
    if (data && data.Answer && data.Answer.length > 0) {
      let ptr = data.Answer[0].data || '';
      if (ptr.endsWith('.')) ptr = ptr.slice(0, -1);
      return ptr;
    }
  } catch (err) {
    console.warn('PTR lookup failed via Google DNS:', err);
  }
  return 'No PTR Record / Direct Network';
}

// 🕵️ Comprehensive Detective Method Audit (ASN, PTR, WebRTC, Timezone)
async function runDetectiveAudit(ip, ipTimezone, orgName, ispName) {
  const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Run WebRTC Leak Test & PTR DNS Lookup in parallel
  const [webrtcResult, ptrHostname] = await Promise.all([
    performWebRtcLeakTest(ip),
    performPtrLookup(ip)
  ]);

  // 1. ASN & ISP Details Check
  let asnString = 'Unknown ASN';
  let isDatacenterHosting = false;
  let isMobileCarrier = false;
  let fullOrgName = orgName || ispName || 'Consumer Network';

  try {
    const res = await fetchWithTimeout(`http://ip-api.com/json/${ip}?fields=as,isp,org,hosting,proxy,mobile`, {}, 4000);
    const data = await res.json();
    if (data) {
      if (data.as) asnString = data.as;
      if (data.org || data.isp) fullOrgName = data.org || data.isp;
      if (data.hosting || data.proxy) isDatacenterHosting = true;
      if (data.mobile) isMobileCarrier = true;
    }
  } catch (e) {
    console.warn('ASN data check failed:', e);
  }

  // Datacenter / Cloud / VPN Keyword Signatures
  const datacenterKeywords = [
    'vpn', 'proxy', 'hosting', 'cloud', 'datacenter', 'm247', 'datacamp', 
    'ovh', 'linode', 'digitalocean', 'hetzner', 'leaseweb', 'nord', 'expressvpn', 
    'proton', 'warp', 'cloudflare', 'surfshark', 'cyberghost', 'mullvad', 'vultr', 
    'aws', 'amazon', 'google cloud', 'azure', 'hostinger', 'choopa'
  ];

  const orgLower = fullOrgName.toLowerCase();
  const ptrLower = ptrHostname.toLowerCase();

  const asnFlagged = datacenterKeywords.some(kw => orgLower.includes(kw)) || isDatacenterHosting;
  const ptrFlagged = datacenterKeywords.some(kw => ptrLower.includes(kw));

  // 2. Render ASN Evidence Box
  asnCheckVal.classList.remove('font-loading');
  if (asnFlagged) {
    asnCheckVal.innerHTML = `<span class="val-alert">🚩 Flagged (Cloud / Datacenter)</span><br><small style="color:var(--text-muted)">${asnString} (${fullOrgName})</small>`;
  } else {
    asnCheckVal.innerHTML = `<span class="val-safe">✓ Verified Consumer ISP</span><br><small style="color:var(--text-muted)">${asnString} (${fullOrgName})</small>`;
  }

  // 3. Render PTR Evidence Box
  ptrCheckVal.classList.remove('font-loading');
  if (ptrFlagged) {
    ptrCheckVal.innerHTML = `<span class="val-alert">🚩 VPN Hostname Keyword</span><br><small style="color:var(--text-muted)">PTR: ${ptrHostname}</small>`;
  } else {
    ptrCheckVal.innerHTML = `<span class="val-safe">✓ Standard Network Hostname</span><br><small style="color:var(--text-muted)">${ptrHostname}</small>`;
  }

  // 4. Render WebRTC Leak Box
  webrtcCheckVal.classList.remove('font-loading');
  if (webrtcResult.hasLeak) {
    const leakedList = webrtcResult.leakedIps.join(', ');
    webrtcCheckVal.innerHTML = `<span class="val-safe">✓ Candidate Matched</span><br><small style="color:var(--text-muted)">Subnet IP: ${leakedList}</small>`;
  } else {
    webrtcCheckVal.innerHTML = `<span class="val-safe">✓ Candidate Matched</span><br><small style="color:var(--text-muted)">No Mismatch Leaked</small>`;
  }

  // 5. Render Timezone Box with Equivalence Normalization (Asia/Calcutta == Asia/Kolkata)
  const isTzMismatch = checkTimezoneMismatch(systemTimezone, ipTimezone);
  tzCheckVal.classList.remove('font-loading');
  if (isTzMismatch) {
    tzCheckVal.innerHTML = `<span class="val-alert">⚠️ Timezone Mismatch</span><br><small style="color:var(--text-muted)">OS: ${systemTimezone} vs IP: ${ipTimezone}</small>`;
  } else {
    tzCheckVal.innerHTML = `<span class="val-safe">✓ Timezone Verified</span><br><small style="color:var(--text-muted)">Matched (${systemTimezone})</small>`;
  }

  // 🕵️ Generate Transparent "Detective's Conclusion"
  const isSuspicious = asnFlagged || ptrFlagged || isTzMismatch;

  if (isSuspicious) {
    vpnBadge.className = 'vpn-badge badge-vpn';
    vpnBadgeText.textContent = 'VPN / Datacenter Connection ⚠️';

    let evidencePoints = [];
    if (asnFlagged) evidencePoints.push(`association with a cloud hosting provider / datacenter (${asnString}, ${fullOrgName})`);
    if (ptrFlagged) evidencePoints.push(`a PTR hostname containing datacenter keywords ('${ptrHostname}')`);
    if (isTzMismatch) evidencePoints.push(`a timezone mismatch between system OS (${systemTimezone}) and IP (${ipTimezone})`);

    const evidenceText = evidencePoints.join(' and ');
    detectiveConclusionText.innerHTML = `
      Our analysis indicates that this IP address has <b>${evidenceText}</b>. This is a <b>strong indication of VPN, Proxy, or Cloud Datacenter usage</b>.
    `;
  } else {
    vpnBadge.className = 'vpn-badge badge-personal';
    vpnBadgeText.textContent = 'Personal / Residential IP 🛡️';

    const netType = isMobileCarrier ? 'mobile carrier network' : 'consumer residential ISP';
    detectiveConclusionText.innerHTML = `
      Our analysis shows this IP belongs to a standard <b>${netType}</b> (${asnString}, ${fullOrgName}) with verified PTR records and matching system timezone alignment. This is a <b>strong indication of a direct personal connection (No VPN)</b>.
    `;
  }
}

// Helper UI loading state
function setLoadingState(isLoading) {
  if (isLoading) {
    knowIpBtn.disabled = true;
    btnText.textContent = 'Detecting...';
    btnIcon.classList.add('spin-icon');
    if (recheckBtn) recheckBtn.disabled = true;
    if (copyAllBtn) copyAllBtn.disabled = true;
    if (downloadBtn) downloadBtn.disabled = true;
  } else {
    knowIpBtn.disabled = false;
    btnText.textContent = 'Know My IP';
    btnIcon.classList.remove('spin-icon');
    if (recheckBtn) recheckBtn.disabled = false;
    if (copyAllBtn) copyAllBtn.disabled = false;
    if (downloadBtn) downloadBtn.disabled = false;
  }
}

// Toast Notification Helper
let toastTimeout;
function showToast(message, icon = '✨') {
  const toastEl = document.getElementById('toast');
  const toastMsgEl = document.getElementById('toastMessage');
  const toastIconEl = document.getElementById('toastIcon');
  if (!toastEl) return;

  toastMsgEl.textContent = message;
  toastIconEl.textContent = icon;
  
  toastEl.classList.remove('hidden');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 2500);
}

// Clipboard helper
async function copyToClipboard(text, btnElement, toastLabel = 'Copied to clipboard!') {
  try {
    await navigator.clipboard.writeText(text);
    if (btnElement) {
      btnElement.classList.add('copied');
      setTimeout(() => {
        btnElement.classList.remove('copied');
      }, 2000);
    }
    showToast(toastLabel, '📋');
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
  }
}

// Copy Full Report
function handleCopyFullReport() {
  const report = [
    `=============================================================`,
    `               IP FINDER DETECTIVE REPORT                    `,
    `=============================================================`,
    `Timestamp: ${new Date().toLocaleString()}`,
    ``,
    `IPv4 Address : ${state.ipv4 || 'Not Detected'}`,
    `IPv6 Address : ${state.ipv6 || 'Not Supported'}`,
    `Location     : ${detailLocationEl.textContent.trim()}`,
    `ISP / Telecom: ${detailIspEl.textContent.trim()}`,
    `Organization : ${detailOrgEl.textContent.trim()}`,
    `Timezone     : ${detailTimezoneEl.textContent.trim()}`,
    `Detected Status: ${vpnBadgeText.textContent.trim()}`,
    ``,
    `--- DETECTIVE CONCLUSION ---`,
    `${detectiveConclusionText.textContent.trim()}`,
    `=============================================================`
  ].join('\n');

  copyToClipboard(report, null, 'Full Report Copied to Clipboard!');
  
  const originalText = copyAllBtn.innerHTML;
  copyAllBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    Report Copied!
  `;
  setTimeout(() => {
    copyAllBtn.innerHTML = originalText;
  }, 2000);
}

// Download Full Report in Native Vector PDF Format
async function handleDownloadReport() {
  const downloadBtnText = downloadBtn ? downloadBtn.innerHTML : '';
  if (downloadBtn) {
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = `
      <svg class="spin-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="2" x2="12" y2="6"></line>
        <line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line>
        <line x1="18" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
      </svg>
      <span>Generating PDF...</span>
    `;
  }

  try {
    let jsPDFClass = window.jspdf ? window.jspdf.jsPDF : null;

    if (!jsPDFClass) {
      // Load jsPDF library dynamically if needed
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        s.onload = res;
        s.onerror = rej;
        document.head.appendChild(s);
      });
      jsPDFClass = window.jspdf.jsPDF;
    }

    const doc = new jsPDFClass({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const timestamp = new Date().toLocaleString();
    const primaryColor = [79, 70, 229];   // Indigo #4F46E5
    const textColor = [30, 41, 59];       // Slate 800
    const lightBg = [241, 245, 249];      // Slate 100

    // Header Banner
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('IP FINDER NETWORK & SECURITY REPORT', 14, 17);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${timestamp}`, 196, 17, { align: 'right' });

    let y = 35;

    // Helper for Section Header
    const addSectionTitle = (title) => {
      doc.setFillColor(...lightBg);
      doc.rect(14, y - 4, 182, 7, 'F');
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(title, 17, y + 1);
      y += 9;
    };

    // Helper for Data Rows
    const addRow = (label, val, isBold = false) => {
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(label, 17, y);

      doc.setTextColor(...textColor);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');

      const textVal = String(val || 'N/A').trim();
      const splitText = doc.splitTextToSize(textVal, 115);
      doc.text(splitText, 72, y);

      y += (splitText.length * 4.5) + 2.5;
    };

    // 1. IP Identification
    addSectionTitle('1. IP ADDRESS IDENTIFICATION');
    addRow('IPv4 Address:', state.ipv4 || 'Not Detected', true);
    addRow('IPv6 Address:', state.ipv6 || 'Not Supported', true);
    y += 3;

    // 2. Geolocation Specs
    addSectionTitle('2. NETWORK & GEOLOCATION SPECS');
    addRow('Location:', detailLocationEl.textContent.trim());
    addRow('ISP / Telecom:', detailIspEl.textContent.trim());
    addRow('Organization:', detailOrgEl.textContent.trim());
    addRow('Timezone:', detailTimezoneEl.textContent.trim());
    y += 3;

    // 3. Detective Security Signals
    addSectionTitle('3. DETECTIVE SECURITY AUDIT');
    addRow('ASN & ISP Check:', asnCheckVal.textContent.replace(/\s+/g, ' ').trim());
    addRow('Reverse DNS PTR:', ptrCheckVal.textContent.replace(/\s+/g, ' ').trim());
    addRow('WebRTC Audit:', webrtcCheckVal.textContent.replace(/\s+/g, ' ').trim());
    addRow('Timezone Audit:', tzCheckVal.textContent.replace(/\s+/g, ' ').trim());
    addRow('Detected Status:', vpnBadgeText.textContent.trim(), true);
    y += 3;

    // 4. Detective Conclusion Box
    addSectionTitle('4. DETECTIVE CONCLUSION VERDICT');
    
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    
    const rawConclusion = detectiveConclusionText.textContent.trim();
    const splitConclusion = doc.splitTextToSize(rawConclusion, 172);
    const boxHeight = (splitConclusion.length * 4.5) + 7;

    doc.rect(14, y - 2, 182, boxHeight, 'FD');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.text(splitConclusion, 18, y + 3);

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 280, 196, 280);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text('Generated by IP Finder • Confidential Client Inspection Document', 105, 286, { align: 'center' });

    // Download PDF File
    doc.save(`IP_Finder_Report_${Date.now()}.pdf`);
    showToast('PDF Report Saved to Downloads!', '📄');

  } catch (err) {
    console.error('jsPDF generation failed:', err);
    alert('PDF Generation failed. Please try again.');
  } finally {
    if (downloadBtn) {
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = downloadBtnText;
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
