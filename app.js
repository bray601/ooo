const svg = document.getElementById("networkGraph");
const zoomGroup = document.getElementById("zoomGroup");

const nodes = [
  {id:"A1", x:330,y:82,r:14,c:"node-blue", label:"SocialHub"},
  {id:"A2", x:420,y:82,r:10,c:"node-violet", label:"Masyarakat"},
  {id:"A3", x:218,y:145,r:9,c:"node-core", label:"RadioMat"},
  {id:"A4", x:300,y:142,r:12,c:"node-core", label:"HashtagMaster"},
  {id:"A5", x:348,y:132,r:9,c:"node-core", label:"@kedaulatan"},
  {id:"A6", x:395,y:142,r:13,c:"node-blue", label:"ChannelX"},
  {id:"A7", x:445,y:137,r:8,c:"node-green", label:"DataInsight"},
  {id:"A8", x:492,y:154,r:12,c:"node-violet", label:"Commentary"},
  {id:"A9", x:338,y:190,r:11,c:"node-amber", label:"Berita"},
  {id:"A10", x:392,y:206,r:17,c:"node-amber", label:"NetizenVoice"},
  {id:"A11", x:450,y:190,r:10,c:"node-amber", label:"Trends"},
  {id:"A12", x:180,y:215,r:7,c:"node-core", label:"@monitor"},
  {id:"A13", x:236,y:225,r:9,c:"node-core", label:"Observer"},
  {id:"A14", x:288,y:215,r:8,c:"node-blue", label:"Forum_01"},
  {id:"A15", x:520,y:225,r:8,c:"node-violet", label:"Creator"},
  {id:"A16", x:560,y:205,r:7,c:"node-green", label:"Analyst"},
  {id:"A17", x:600,y:170,r:6,c:"node-green", label:"API_Node"},
  {id:"A18", x:260,y:108,r:6,c:"node-core", label:"Tag_02"},
  {id:"A19", x:470,y:92,r:7,c:"node-green", label:"Tag_14"},
  {id:"A20", x:575,y:125,r:6,c:"node-green", label:"Tag_08"}
];

const edgePairs = [
  [0,1],[0,3],[0,5],[1,5],[1,7],[2,3],[2,12],[3,4],[3,5],[3,8],
  [4,5],[4,8],[5,6],[5,7],[5,9],[5,10],[6,10],[6,16],[7,10],[7,14],
  [8,9],[8,12],[8,13],[9,10],[9,13],[9,14],[10,14],[11,12],[12,13],
  [13,14],[14,15],[15,16],[16,19],[17,2],[17,3],[18,6],[18,7],[19,16]
];

function renderGraph() {
  zoomGroup.innerHTML = "";
  edgePairs.forEach(([a,b]) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1",nodes[a].x); line.setAttribute("y1",nodes[a].y);
    line.setAttribute("x2",nodes[b].x); line.setAttribute("y2",nodes[b].y);
    line.setAttribute("class","edge");
    zoomGroup.appendChild(line);
  });
  nodes.forEach((node) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg","g");
    group.dataset.id = node.id;
    group.dataset.label = node.label.toLowerCase();
    const ring = document.createElementNS("http://www.w3.org/2000/svg","circle");
    ring.setAttribute("cx",node.x); ring.setAttribute("cy",node.y); ring.setAttribute("r",node.r + 5);
    ring.setAttribute("fill","none"); ring.setAttribute("stroke","rgba(99,177,194,.18)");
    ring.setAttribute("stroke-width","1");
    const circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
    circle.setAttribute("cx",node.x); circle.setAttribute("cy",node.y); circle.setAttribute("r",node.r);
    circle.setAttribute("class","node " + node.c);
    circle.addEventListener("click", () => selectNode(node));
    group.appendChild(ring); group.appendChild(circle);
    if (node.r >= 11) {
      const text = document.createElementNS("http://www.w3.org/2000/svg","text");
      text.setAttribute("x",node.x); text.setAttribute("y",node.y + node.r + 11);
      text.setAttribute("text-anchor","middle"); text.setAttribute("class","node-label");
      text.textContent = node.label;
      group.appendChild(text);
    }
    zoomGroup.appendChild(group);
  });
}

const jobs = [
  ["JOB-48810","hurricane response","Collection","SUCCESS","12.8K","09:21","2026-11-18 14:09"],
  ["JOB-48792","@detikcom account","Collection","SUCCESS","4.6K","06:42","2026-11-18 13:51"],
  ["JOB-48784","#demonstrasi","Collection","PARTIAL","18.2K","11:03","2026-11-18 13:18"],
  ["JOB-48731","global media dataset","Graph Build","SUCCESS","42.9K","02:16","2026-11-18 12:44"],
  ["JOB-48690","temporal snapshot","SNA Analysis","RUNNING","—","—","2026-11-18 11:58"]
];

function renderJobs() {
  document.getElementById("jobTable").innerHTML = jobs.map(j => `
    <tr>
      <td class="job-id">${j[0]}</td><td class="target">${j[1]}</td><td>${j[2]}</td>
      <td class="status-cell ${j[3] === "PARTIAL" || j[3] === "RUNNING" ? "" : ""}">${j[3]}</td>
      <td>${j[4]}</td><td>${j[5]}</td><td>${j[6]}</td>
    </tr>`).join("");
}

const rankings = [
  ["NV","NetizenVoice","Betweenness","0.856","node-amber"],
  ["CX","ChannelX","Betweenness","0.720","node-blue"],
  ["CO","Commentary","Betweenness","0.649","node-violet"],
  ["SH","SocialHub","PageRank","0.491","node-blue"],
  ["BM","Berita","PageRank","0.436","node-amber"]
];

function renderRanking() {
  document.getElementById("ranking").innerHTML = rankings.map((r,i) => `
    <div class="rank-row">
      <div class="rank-node">${r[0]}</div>
      <div class="rank-info"><strong>${r[1]}</strong><span>${r[2]} · Rank ${i+1}</span></div>
      <div class="rank-score">${r[3]}</div>
    </div>`).join("");
}

let scale = 1;
function setScale(next) {
  scale = Math.max(.75, Math.min(1.35, next));
  zoomGroup.style.transform = `scale(${scale})`;
  zoomGroup.style.transformOrigin = "50% 50%";
}

document.getElementById("zoomIn").addEventListener("click", () => setScale(scale + .1));
document.getElementById("zoomOut").addEventListener("click", () => setScale(scale - .1));
document.getElementById("fitGraph").addEventListener("click", () => setScale(1));
document.getElementById("resetLayout").addEventListener("click", () => {
  renderGraph();
  setScale(1);
  showToast("Layout reset");
});

document.getElementById("layoutSelect").addEventListener("change", (event) => {
  const layout = event.target.value;
  if (layout === "radial") setScale(.92);
  if (layout === "grid") setScale(.82);
  if (layout === "force") setScale(1);
  showToast(`${event.target.selectedOptions[0].text} layout applied`);
});

document.getElementById("nodeSearch").addEventListener("input", (event) => {
  const term = event.target.value.trim().toLowerCase();
  document.querySelectorAll("#zoomGroup g").forEach(group => {
    group.style.opacity = !term || group.dataset.label.includes(term) ? "1" : ".12";
  });
  document.getElementById("visibleNodes").textContent = term ? "Filtered node view" : "42,936 nodes · 178,291 edges";
});

document.getElementById("metricSelect").addEventListener("change", (event) => {
  document.querySelectorAll(".node").forEach((node,i) => {
    node.setAttribute("r", String([14,12,10,13,9][i % 5] + (event.target.value === "pagerank" ? 2 : 0)));
  });
  showToast(`Metric overlay: ${event.target.selectedOptions[0].text}`);
});

document.querySelectorAll(".legend-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".legend-item").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    const community = button.dataset.community;
    document.querySelectorAll("#zoomGroup g").forEach((group,i) => {
      group.style.opacity = community === "all" || i % 4 === ["c1","c2","c3","c4"].indexOf(community) ? "1" : ".18";
    });
  });
});

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    if (button.closest(".nav")) button.classList.add("active");
    showToast(`${button.dataset.section} workspace selected`);
  });
});

function selectNode(node) {
  showToast(`Selected node: ${node.label} · Degree 128`);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

document.getElementById("runAnalysis").addEventListener("click", () => {
  const button = document.getElementById("runAnalysis");
  button.textContent = "◌ Computation Running";
  document.getElementById("runStatus").textContent = "Running";
  setTimeout(() => {
    button.textContent = "▶ Run SNA Computation";
    document.getElementById("runStatus").textContent = "Completed";
    document.getElementById("runTime").textContent = "99.34s";
    showToast("SNA computation completed");
  }, 1600);
});

document.getElementById("exportButton").addEventListener("click", () => {
  const csv = "job_id,target,status,records\n" + jobs.map(j => j.join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = "sna-job-report.csv"; anchor.click();
  URL.revokeObjectURL(url);
  showToast("CSV report exported");
});

renderGraph();
renderJobs();
renderRanking();
