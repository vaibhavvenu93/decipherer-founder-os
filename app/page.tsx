"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type View =
  | "Today"
  | "Command"
  | "Live"
  | "Companies"
  | "Memory"
  | "Sources"
  | "Control";

type Company =
  | "ALL"
  | "XALEN"
  | "VEDIKA"
  | "GRAHA GURU"
  | "BOOKMYMANDIR";

type Workflow =
  | "truthkeeper"
  | "prioritizer"
  | "graduation"
  | "dependency"
  | null;

type WorkflowState =
  | "idle"
  | "running"
  | "returned"
  | "approved";

type AgentStatus =
  | "AWAKE"
  | "WORKING"
  | "WATCHING"
  | "SLEEPING";

type AgentName =
  | "Chief of Staff"
  | "Truthkeeper"
  | "Revenue Intelligence"
  | "Product Radar"
  | "Dependency Agent"
  | "Research Agent"
  | "Execution Agent"
  | "Founder Memory";

type Agent = {
  name: AgentName;
  role: string;
  status: AgentStatus;
  mission: string;
  company: string;
  autonomy: string;
  activity: string;
  greeting: string;
};

type ChatMessage = {
  role: "user" | "assistant" | "system";
  text: string;
  agent?: AgentName;
};

type MemoryItem = {
  id: number;
  type: string;
  title: string;
  company: string;
  detail: string;
  reopen: string;
  date: string;
};

type SourceStatus =
  | "AVAILABLE"
  | "CONNECTING"
  | "INDEXING"
  | "CONNECTED";

type Source = {
  name: string;
  type: string;
  detail: string;
  indexed: string;
  signals: string;
};

/* =========================================================
   CONSTANT DATA
========================================================= */

const companies: Company[] = [
  "ALL",
  "XALEN",
  "VEDIKA",
  "GRAHA GURU",
  "BOOKMYMANDIR",
];

const companyFacts = {
  XALEN: {
    name: "Xalen",
    description:
      "AI infrastructure, model access and shared intelligence layer across the group.",
    facts: [
      "200+ AI models publicly advertised.",
      "One OpenAI-compatible API.",
      "Marketplace spans multiple AI modalities.",
      "Vedika appears inside the wider capability estate.",
      "Wallet-backed pay-as-you-go access is publicly visible.",
    ],
  },

  VEDIKA: {
    name: "Vedika",
    description:
      "Domain-specialist intelligence platform with developer, API and enterprise paths.",
    facts: [
      "Starter wallet publicly listed at $12/month.",
      "Professional wallet publicly listed at $60/month.",
      "Business wallet publicly listed at $120/month.",
      "Enterprise wallet publicly listed at $240/month plus top-ups.",
      "Free developer sandbox is publicly available.",
      "Higher tiers unlock additional commercial capabilities.",
    ],
  },

  "GRAHA GURU": {
    name: "Graha Guru",
    description:
      "Consumer astrology experience powered by specialised intelligence from the wider group.",
    facts: [
      "Built and operated by Xalen Technology.",
      "Vedika powers predictions and conversations.",
      "Web and mobile consumer surfaces.",
      "Multilingual consumer experience.",
      "Separate commerce / spiritual-products surface.",
    ],
  },

  BOOKMYMANDIR: {
    name: "BookMyMandir",
    description:
      "Institutional operating software for temples and faith institutions.",
    facts: [
      "Temple remains the customer.",
      "Publicly states 0% of temple offerings are taken.",
      "100 planned tools are publicly catalogued.",
      "21 marked production verified.",
      "59 marked source complete.",
      "1 customer beta.",
      "1 foundation only.",
      "18 not built.",
    ],
  },
};

const nightShiftEvents = [
  {
    time: "01:14",
    agent: "Revenue Intelligence",
    company: "VEDIKA",
    title:
      "Account crossed enterprise-intent threshold.",
    outcome:
      "Account context reconstructed. Expansion brief prepared.",
    founder: false,
  },
  {
    time: "02:38",
    agent: "Product Radar",
    company: "BOOKMYMANDIR",
    title: "Backlog dependency changed.",
    outcome:
      "Institution onboarding moved above lower-leverage product work.",
    founder: false,
  },
  {
    time: "03:42",
    agent: "Execution Agent",
    company: "BOOKMYMANDIR",
    title:
      "Institution onboarding friction detected.",
    outcome:
      "Implementation task prepared and routed to the operating queue.",
    founder: false,
  },
  {
    time: "04:26",
    agent: "Dependency Agent",
    company: "GROUP",
    title:
      "Shared voice capability has no canonical owner.",
    outcome:
      "Cross-company ownership decision prepared.",
    founder: true,
  },
  {
    time: "05:23",
    agent: "Truthkeeper",
    company: "XALEN",
    title:
      "Commercial truth mismatch detected.",
    outcome:
      "Three public surfaces reconciled. Founder decision required.",
    founder: true,
  },
];

const agents: Agent[] = [
  {
    name: "Chief of Staff",
    role: "Orchestrator",
    status: "AWAKE",
    mission:
      "Route ambiguity to the right agent, coordinate cross-company work and keep founder attention clean.",
    company: "GROUP",
    autonomy: "Prepare + Route",
    activity: "14 missions coordinated today",
    greeting:
      "I'm the orchestration layer. Ask across any company, account, decision, risk or open thread.",
  },
  {
    name: "Truthkeeper",
    role: "Canonical truth",
    status: "WORKING",
    mission:
      "Reconcile product, pricing, docs and commercial truth.",
    company: "XALEN",
    autonomy: "Investigate",
    activity: "3 commercial surfaces under review",
    greeting:
      "I'm reconciling Xalen's commercial truth. I can explain contradictions, evidence and what still needs authority.",
  },
  {
    name: "Revenue Intelligence",
    role: "Commercial intelligence",
    status: "WORKING",
    mission:
      "Detect product-led graduation, enterprise intent and expansion opportunities.",
    company: "VEDIKA",
    autonomy: "Prepare",
    activity: "4 accounts surfaced",
    greeting:
      "I'm watching Vedika usage, account intent and expansion signals. Ask me which accounts deserve attention and why.",
  },
  {
    name: "Product Radar",
    role: "Product prioritisation",
    status: "WORKING",
    mission:
      "Prioritise BookMyMandir work by demand, leverage, dependency and effort.",
    company: "BOOKMYMANDIR",
    autonomy: "Recommend",
    activity: "100 tools mapped",
    greeting:
      "I'm ranking BookMyMandir's product estate. Ask me what should ship next, what should wait and what unlocks the most leverage.",
  },
  {
    name: "Dependency Agent",
    role: "Cross-company architecture",
    status: "WATCHING",
    mission:
      "Detect duplicated capability ownership, integration gaps and founder dependency.",
    company: "GROUP",
    autonomy: "Recommend",
    activity: "3 ownership gaps found",
    greeting:
      "I'm watching where the founder is still acting as the integration layer. Ask me about ownership, duplication or shared capabilities.",
  },
  {
    name: "Research Agent",
    role: "Investigation",
    status: "AWAKE",
    mission:
      "Investigate markets, competitors, companies, technologies and unfamiliar questions.",
    company: "GROUP",
    autonomy: "Autonomous",
    activity: "8 research threads completed",
    greeting:
      "Give me an unfamiliar question. I'll investigate, compare evidence and return a concise conclusion.",
  },
  {
    name: "Execution Agent",
    role: "Follow-through",
    status: "AWAKE",
    mission:
      "Track approved work until there is evidence of an outcome.",
    company: "GROUP",
    autonomy: "Execute",
    activity: "11 items moving without founder",
    greeting:
      "I own follow-through. Ask what is still open, blocked, overdue or waiting on someone.",
  },
  {
    name: "Founder Memory",
    role: "Institutional memory",
    status: "WATCHING",
    mission:
      "Store decisions, assumptions, context and reopening conditions.",
    company: "GROUP",
    autonomy: "Observe",
    activity: "29 decisions indexed",
    greeting:
      "I remember why decisions were made, not just what was decided. Ask about past context, assumptions or reopening conditions.",
  },
];

const bmmTools = [
  {
    rank: 1,
    tool: "Institution onboarding",
    score: 92,
    detail:
      "Touches every institution and unlocks downstream workflows.",
  },
  {
    rank: 2,
    tool: "Devotee CRM",
    score: 88,
    detail:
      "Creates persistent institutional memory and recurring utility.",
  },
  {
    rank: 3,
    tool: "Donation operations",
    score: 86,
    detail:
      "High-frequency operational workflow with direct institutional value.",
  },
  {
    rank: 4,
    tool: "Event & festival operations",
    score: 82,
    detail:
      "High operational pain during recurring peak periods.",
  },
  {
    rank: 5,
    tool: "WhatsApp communication",
    score: 81,
    detail:
      "Low effort with immediate distribution and operational leverage.",
  },
  {
    rank: 6,
    tool: "Voice-assisted onboarding",
    score: 80,
    detail:
      "Can reduce implementation friction and reuse shared voice capability.",
  },
  {
    rank: 7,
    tool: "Volunteer operations",
    score: 75,
    detail:
      "Recurring coordination burden across institutions.",
  },
  {
    rank: 8,
    tool: "Inventory & prasadam",
    score: 69,
    detail:
      "Useful but lower strategic leverage than core institutional workflows.",
  },
  {
    rank: 9,
    tool: "Donor intelligence",
    score: 67,
    detail:
      "Valuable after relationship data becomes reliable.",
  },
  {
    rank: 10,
    tool: "Institution analytics",
    score: 65,
    detail:
      "Becomes stronger after core operations generate high-quality data.",
  },
];

const vedikaAccounts = [
  {
    name: "Astra Labs",
    intent: 91,
    recommendation: "Enterprise",
    reason:
      "High API usage + enterprise feature exploration + repeated production testing.",
  },
  {
    name: "JyotishCloud",
    intent: 82,
    recommendation: "Business",
    reason:
      "Healthy production usage approaching higher-tier economics.",
  },
  {
    name: "RitualAI",
    intent: 78,
    recommendation: "Founder watch",
    reason:
      "Very high exploration but low production usage.",
  },
  {
    name: "TempleStack",
    intent: 94,
    recommendation: "Xalen expansion",
    reason:
      "High usage plus broader infrastructure requirements indicate platform-level opportunity.",
  },
];

const dependencyItems = [
  {
    capability: "Voice",
    companies:
      "VEDIKA · GRAHA GURU · BOOKMYMANDIR",
    owner: "UNRESOLVED",
    recommendation:
      "Make Xalen the canonical shared service.",
  },
  {
    capability: "Identity / user context",
    companies: "VEDIKA · GRAHA GURU",
    owner: "UNRESOLVED",
    recommendation:
      "Create a group-level context contract before implementations diverge.",
  },
  {
    capability: "Account intelligence",
    companies:
      "VEDIKA · XALEN · BOOKMYMANDIR",
    owner: "UNRESOLVED",
    recommendation:
      "Use one persistent account brain across the group.",
  },
  {
    capability: "Founder Memory",
    companies: "GROUP",
    owner: "DECIPHERER",
    recommendation:
      "Store strategic decisions and reopening conditions centrally.",
  },
];

const initialMemory: MemoryItem[] = [
  {
    id: 1,
    type: "DECISION",
    title:
      "Do not change headline pricing before packaging is clarified.",
    company: "VEDIKA",
    detail:
      "Evidence suggested commercial ambiguity was stronger than price sensitivity.",
    reopen:
      "Reopen if stalled opportunities remain blocked after packaging clarification.",
    date: "SEP 01",
  },
  {
    id: 2,
    type: "PRINCIPLE",
    title:
      "Founder should not be the integration layer.",
    company: "GROUP",
    detail:
      "Cross-company ambiguity should first route through agents and canonical owners.",
    reopen:
      "Reopen when a new shared capability has no owner.",
    date: "SEP 01",
  },
  {
    id: 3,
    type: "PRODUCT",
    title:
      "BookMyMandir should optimise for institutional adoption before breadth.",
    company: "BOOKMYMANDIR",
    detail:
      "Production readiness matters more than total tool count.",
    reopen:
      "Re-rank when institution demand or dependencies change.",
    date: "SEP 01",
  },
];

const sourceCatalog: Source[] = [
  {
    name: "CRM",
    type: "Accounts + pipeline",
    detail:
      "HubSpot, Salesforce or CRM export feeds account context, pipeline movement and commercial intent.",
    indexed: "1,248 accounts indexed",
    signals: "17 commercial signals detected",
  },
  {
    name: "Email",
    type: "Communication",
    detail:
      "Gmail or Outlook context becomes commitments, unresolved asks, risks and follow-ups.",
    indexed: "6,402 messages indexed",
    signals: "31 open commitments detected",
  },
  {
    name: "Slack / Teams",
    type: "Internal communication",
    detail:
      "Internal discussions become decisions, blockers, contradictions and ownership signals.",
    indexed: "18 channels indexed",
    signals: "12 unresolved threads detected",
  },
  {
    name: "Call transcripts",
    type: "Voice intelligence",
    detail:
      "Gong, Otter, Fireflies or uploaded transcripts feed customer and commercial intelligence.",
    indexed: "83 transcripts indexed",
    signals: "9 repeated objections detected",
  },
  {
    name: "Google Drive",
    type: "Documents",
    detail:
      "Reports, decks, contracts and spreadsheets become company memory and source evidence.",
    indexed: "214 files indexed",
    signals: "8 conflicting claims detected",
  },
  {
    name: "GitHub",
    type: "Engineering",
    detail:
      "Commits, pull requests and issues become delivery, risk and dependency signals.",
    indexed: "392 pull requests indexed",
    signals: "6 delivery risks detected",
  },
  {
    name: "Jira",
    type: "Execution",
    detail:
      "Tasks, blockers, owners and dependencies stay visible until outcomes are verified.",
    indexed: "814 issues indexed",
    signals: "27 overdue dependencies detected",
  },
  {
    name: "Public web",
    type: "External evidence",
    detail:
      "Public company and product information forms the external reality layer used in this prototype.",
    indexed: "Public surfaces mapped",
    signals: "3 commercial inconsistencies detected",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function statusDot(status: AgentStatus) {
  if (status === "WORKING")
    return "bg-[#6B63F6] animate-pulse";

  if (status === "AWAKE")
    return "bg-[#25815B]";

  if (status === "WATCHING")
    return "bg-[#C78922]";

  return "bg-[#B9BBC1]";
}

function scoreColor(score: number) {
  if (score >= 85)
    return "text-[#25815B]";

  if (score >= 75)
    return "text-[#5955E7]";

  return "text-[#C78922]";
}

function agentByName(
  name: AgentName
) {
  return agents.find(
    (agent) => agent.name === name
  )!;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Home() {
  const [view, setView] =
    useState<View>("Today");

  const [company, setCompany] =
    useState<Company>("ALL");

  const [workflow, setWorkflow] =
    useState<Workflow>(null);

  const [
    workflowState,
    setWorkflowState,
  ] =
    useState<WorkflowState>("idle");

  const [chaos, setChaos] =
    useState("");

  const [deciphering, setDeciphering] =
    useState(false);

  const [deciphered, setDeciphered] =
    useState(false);

  const [
    activeAgent,
    setActiveAgent,
  ] =
    useState<AgentName>(
      "Chief of Staff"
    );

  const [
    selectedAgent,
    setSelectedAgent,
  ] =
    useState<Agent | null>(null);

  const [
    chatInput,
    setChatInput,
  ] =
    useState("");

  const [
    chatMessages,
    setChatMessages,
  ] =
    useState<ChatMessage[]>([
      {
        role: "assistant",
        agent: "Chief of Staff",
        text:
          "I'm awake. Ask me about any company, decision, risk, account, product or open thread.",
      },
    ]);

  const [
    evidenceOpen,
    setEvidenceOpen,
  ] =
    useState(false);

  const [
    memories,
    setMemories,
  ] =
    useState<MemoryItem[]>(
      initialMemory
    );

  const [
    sourceStates,
    setSourceStates,
  ] =
    useState<
      Record<string, SourceStatus>
    >({});

  const chaosResultRef =
    useRef<HTMLDivElement>(null);

  const workflowRef =
    useRef<HTMLDivElement>(null);

  const commandBottomRef =
    useRef<HTMLDivElement>(null);

  /* =========================================================
     PERSISTENCE
  ========================================================= */

  useEffect(() => {
    const stored =
      localStorage.getItem(
        "decipherer-v08"
      );

    if (!stored) return;

    try {
      const parsed =
        JSON.parse(stored);

      if (parsed.memories)
        setMemories(
          parsed.memories
        );

      if (parsed.sourceStates)
        setSourceStates(
          parsed.sourceStates
        );
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "decipherer-v08",
      JSON.stringify({
        memories,
        sourceStates,
      })
    );
  }, [memories, sourceStates]);

  /* =========================================================
     SCROLLING
  ========================================================= */

  useEffect(() => {
    if (!deciphered) return;

    const timer = setTimeout(() => {
      chaosResultRef.current?.scrollIntoView(
        {
          behavior: "smooth",
          block: "start",
        }
      );
    }, 120);

    return () =>
      clearTimeout(timer);
  }, [deciphered]);

  useEffect(() => {
    if (!workflow) return;

    const timer = setTimeout(() => {
      workflowRef.current?.scrollIntoView(
        {
          behavior: "smooth",
          block: "start",
        }
      );
    }, 100);

    return () =>
      clearTimeout(timer);
  }, [workflow]);

  useEffect(() => {
    if (view !== "Command")
      return;

    const timer = setTimeout(() => {
      commandBottomRef.current?.scrollIntoView(
        {
          behavior: "smooth",
          block: "end",
        }
      );
    }, 80);

    return () =>
      clearTimeout(timer);
  }, [chatMessages, view]);

  const activeCompany =
    useMemo(() => {
      if (company === "ALL")
        return null;

      return companyFacts[
        company as Exclude<
          Company,
          "ALL"
        >
      ];
    }, [company]);

  const currentAgent =
    agentByName(activeAgent);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  function navigate(
    next: View,
    preserveScroll = false
  ) {
    setView(next);

    if (!preserveScroll) {
      setWorkflow(null);
      setWorkflowState("idle");

      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    }
  }

  function openWorkflow(
    next: Exclude<Workflow, null>
  ) {
    setWorkflow(next);
    setWorkflowState("idle");
  }

  /* =========================================================
     MEMORY
  ========================================================= */

  function addMemory(
    type: string,
    title: string,
    companyName: string,
    detail: string,
    reopen: string
  ) {
    setMemories((current) => [
      {
        id: Date.now(),
        type,
        title,
        company: companyName,
        detail,
        reopen,
        date: "SEP 01",
      },
      ...current,
    ]);
  }

  /* =========================================================
     WORKFLOW
  ========================================================= */

  function runWorkflow() {
    setWorkflowState("running");

    setTimeout(() => {
      setWorkflowState("returned");
    }, 1100);
  }

  function approveWorkflow() {
    setWorkflowState("approved");

    if (workflow === "truthkeeper") {
      addMemory(
        "DECISION",
        "Canonical Xalen commercial state approved.",
        "XALEN",
        "PAYG remains available. Enterprise remains scoped. Studio remains migration/unavailable until authoritative state changes.",
        "Reopen when public pricing or product surfaces diverge."
      );
    }

    if (
      workflow === "prioritizer"
    ) {
      addMemory(
        "PRODUCT",
        "BookMyMandir top-10 roadmap approved.",
        "BOOKMYMANDIR",
        "Institution onboarding and foundational institutional workflows take priority over breadth.",
        "Reopen when institutional demand or dependencies materially change."
      );
    }

    if (
      workflow === "graduation"
    ) {
      addMemory(
        "GTM",
        "Vedika account graduation actions prepared.",
        "VEDIKA",
        "High-intent accounts route to Business, Enterprise or Xalen expansion based on usage and strategic need.",
        "Reopen when account behaviour materially changes."
      );
    }

    if (
      workflow === "dependency"
    ) {
      addMemory(
        "ARCHITECTURE",
        "Cross-company ownership model accepted.",
        "GROUP",
        "Shared capabilities route to canonical owners before escalating to the founder.",
        "Reopen when new shared capabilities appear without ownership."
      );
    }
  }

  /* =========================================================
     GIVE ME CHAOS
  ========================================================= */

  function decipherChaos() {
    if (!chaos.trim()) {
      setChaos(
        "Xalen is moving fast, Vedika has accounts I may be missing, BookMyMandir has too much to build, and I don't want to be the person connecting every team."
      );
    }

    setDeciphered(false);
    setDeciphering(true);

    setTimeout(() => {
      setDeciphering(false);
      setDeciphered(true);
    }, 650);
  }

  /* =========================================================
     AGENT-SPECIFIC CHAT
  ========================================================= */

  function openAgentChat(
    agentName: AgentName
  ) {
    const agent =
      agentByName(agentName);

    setActiveAgent(agentName);

    setChatMessages((current) => [
      ...current,
      {
        role: "system",
        agent: agentName,
        text: `${agentName} joined the conversation.`,
      },
      {
        role: "assistant",
        agent: agentName,
        text: agent.greeting,
      },
    ]);

    setSelectedAgent(null);
    setChatInput("");
    navigate("Command");
  }

  function returnToChiefOfStaff() {
    setActiveAgent(
      "Chief of Staff"
    );

    setChatMessages((current) => [
      ...current,
      {
        role: "system",
        agent: "Chief of Staff",
        text:
          "Chief of Staff resumed orchestration.",
      },
      {
        role: "assistant",
        agent: "Chief of Staff",
        text:
          "I'm back across the full group context. What do you want me to coordinate?",
      },
    ]);
  }

  function handoff(
    from: AgentName,
    to: AgentName,
    reason: string
  ) {
    setChatMessages((current) => [
      ...current,
      {
        role: "assistant",
        agent: from,
        text: reason,
      },
      {
        role: "system",
        text: `${from} → ${to} joined`,
        agent: to,
      },
      {
        role: "assistant",
        agent: to,
        text:
          agentByName(to).greeting,
      },
    ]);

    setActiveAgent(to);
  }

  function agentReply(
    agent: AgentName,
    input: string
  ) {
    const lower =
      input.toLowerCase();

    /* CHIEF OF STAFF */

    if (
      agent === "Chief of Staff"
    ) {
      if (
        lower.includes(
          "overnight"
        ) ||
        lower.includes("slept") ||
        lower.includes("away")
      ) {
        return "Overnight, 5 meaningful events were detected. 3 moved without you. 2 require founder authority: Xalen commercial truth and cross-company capability ownership.";
      }

      if (
        lower.includes("risk") ||
        lower.includes("worried")
      ) {
        return "The highest structural risk is founder dependency. Voice, identity context and account intelligence still have unclear canonical ownership across companies. The second risk is commercial truth drift across Xalen's public surfaces.";
      }

      if (
        lower.includes("vedika")
      ) {
        return "Revenue Intelligence has 4 Vedika accounts surfaced. Astra Labs looks Enterprise-ready; TempleStack appears to be a broader Xalen expansion opportunity.";
      }

      if (
        lower.includes("mandir") ||
        lower.includes("book")
      ) {
        return "Product Radar recommends institution onboarding, Devotee CRM and donation operations before expanding lower-leverage tools.";
      }

      if (
        lower.includes("agents")
      ) {
        return "Truthkeeper, Revenue Intelligence and Product Radar are actively working. Research and Execution are awake. Dependency Agent and Founder Memory are watching.";
      }

      return "I can answer this directly or route it to a specialist. If the answer depends on evidence, I'll investigate first rather than guess.";
    }

    /* TRUTHKEEPER */

    if (
      agent === "Truthkeeper"
    ) {
      if (
        lower.includes("price") ||
        lower.includes(
          "commercial"
        ) ||
        lower.includes("truth")
      ) {
        return "I found three relevant commercial surfaces: wallet-backed PAYG, visible Studio subscription cards and a migration message saying Studio subscriptions are unavailable. My proposed canonical state is PAYG available, Enterprise scoped and Studio migration/unavailable until leadership confirms otherwise.";
      }

      if (
        lower.includes("why") ||
        lower.includes("conflict")
      ) {
        return "The issue is not simply conflicting copy. Different surfaces imply different commercial states, which creates risk for sales, product expectations and customer conversations.";
      }

      if (
        lower.includes("change") &&
        lower.includes("pricing")
      ) {
        setTimeout(() => {
          handoff(
            "Truthkeeper",
            "Revenue Intelligence",
            "Before changing pricing, I want Revenue Intelligence to verify whether current customer behaviour actually indicates price sensitivity."
          );
        }, 450);

        return "Pricing policy crosses into commercial behaviour. I'm bringing Revenue Intelligence into the thread.";
      }

      return "My current job is to reconcile claims into one authoritative state. Ask me what conflicts, what evidence exists or what needs founder authority.";
    }

    /* REVENUE */

    if (
      agent ===
      "Revenue Intelligence"
    ) {
      if (
        lower.includes(
          "templestack"
        )
      ) {
        return "TempleStack has intent 94, strong API usage and broader infrastructure requirements. I would not treat it as a normal Vedika upsell; it looks like a Xalen platform expansion conversation.";
      }

      if (
        lower.includes("astra")
      ) {
        return "Astra Labs has high API usage, repeated production testing and enterprise capability exploration. It is the cleanest Enterprise graduation candidate in the current set.";
      }

      if (
        lower.includes("who") ||
        lower.includes(
          "account"
        ) ||
        lower.includes(
          "attention"
        )
      ) {
        return "Four accounts surfaced. Astra Labs and TempleStack justify the most attention. JyotishCloud is a normal Business-tier progression. RitualAI is interesting, but exploration is still much stronger than production use.";
      }

      if (
        lower.includes("pricing")
      ) {
        setTimeout(() => {
          handoff(
            "Revenue Intelligence",
            "Truthkeeper",
            "Account behaviour alone should not change a commercial policy. Truthkeeper needs to reconcile the authorised commercial state first."
          );
        }, 450);

        return "That crosses from account intelligence into commercial policy. I'm bringing Truthkeeper into this thread.";
      }

      return "I focus on behaviour, intent, expansion and account prioritisation. Ask me who deserves attention, why an account scored high or what action should follow.";
    }

    /* PRODUCT */

    if (
      agent === "Product Radar"
    ) {
      if (
        lower.includes("next") ||
        lower.includes("build") ||
        lower.includes("ship")
      ) {
        return "My current top three are Institution onboarding (92), Devotee CRM (88) and Donation operations (86). They create foundational utility before long-tail product breadth.";
      }

      if (
        lower.includes("voice")
      ) {
        setTimeout(() => {
          handoff(
            "Product Radar",
            "Dependency Agent",
            "Voice-assisted onboarding is attractive, but shared voice ownership is unresolved across the group. Dependency Agent should resolve that architecture before the roadmap assumes ownership."
          );
        }, 450);

        return "Voice-assisted onboarding scores well, but it introduces a cross-company dependency. I'm bringing Dependency Agent into the thread.";
      }

      if (
        lower.includes("why")
      ) {
        return "The ranking optimises for institutional demand, downstream leverage, effort and dependency unlocks. The product estate should not maximise tool count; it should maximise institutional adoption and recurring utility.";
      }

      return "I rank product work by demand, leverage, effort and strategic impact. Ask me what should ship, what should wait or why one item outranks another.";
    }

    /* DEPENDENCY */

    if (
      agent ===
      "Dependency Agent"
    ) {
      if (
        lower.includes("voice")
      ) {
        return "Voice appears across Vedika, Graha Guru and BookMyMandir without a canonical owner. My recommendation is Xalen ownership as the shared infrastructure layer.";
      }

      if (
        lower.includes("founder") ||
        lower.includes(
          "integration"
        )
      ) {
        return "The founder is still functioning as integration glue in three places: shared voice, identity/user context and account intelligence. Those should become explicit ownership contracts instead of repeated founder decisions.";
      }

      if (
        lower.includes("account")
      ) {
        return "Account intelligence is currently a cross-company concern. I recommend one persistent account brain rather than separate CRM interpretations for Vedika, Xalen and BookMyMandir.";
      }

      return "I detect where responsibility is duplicated, missing or silently routed through the founder. Ask me about ownership, architecture or cross-company dependencies.";
    }

    /* RESEARCH */

    if (
      agent === "Research Agent"
    ) {
      return "I would first define the question, collect primary evidence, compare competing explanations, separate fact from inference and return a recommendation with confidence and open unknowns.";
    }

    /* EXECUTION */

    if (
      agent === "Execution Agent"
    ) {
      if (
        lower.includes(
          "blocked"
        ) ||
        lower.includes(
          "overdue"
        )
      ) {
        return "Two items currently deserve intervention: BookMyMandir institution onboarding and the unresolved Xalen canonical commercial state. Everything else is either moving or waiting on a scheduled dependency.";
      }

      return "I track approved work until the outcome exists, not until a message or ticket exists. Ask me what is blocked, overdue, waiting or completed.";
    }

    /* MEMORY */

    if (
      agent === "Founder Memory"
    ) {
      if (
        lower.includes("pricing")
      ) {
        return "The current recorded principle is: do not change headline pricing before packaging is clarified. Reopen only if stalled opportunities remain blocked after packaging clarification.";
      }

      if (
        lower.includes(
          "bookmymandir"
        )
      ) {
        return "The recorded product principle is to optimise for institutional adoption before breadth. Re-rank when institution demand or dependencies materially change.";
      }

      return "I store the decision, why it was made, what assumptions were true at the time and what condition should reopen it.";
    }

    return "I have the current mission context. Ask me what you want investigated.";
  }

  function sendChat(
    providedText?: string
  ) {
    const input =
      providedText ??
      chatInput.trim();

    if (!input) return;

    setChatMessages((current) => [
      ...current,
      {
        role: "user",
        text: input,
      },
    ]);

    setChatInput("");

    const speakingAgent =
      activeAgent;

    setTimeout(() => {
      const reply =
        agentReply(
          speakingAgent,
          input
        );

      setChatMessages(
        (current) => [
          ...current,
          {
            role: "assistant",
            agent:
              speakingAgent,
            text: reply,
          },
        ]
      );
    }, 420);
  }

  /* =========================================================
     SOURCES
  ========================================================= */

  function connectSource(
    name: string
  ) {
    const current =
      sourceStates[name];

    if (
      current === "CONNECTED"
    ) {
      setSourceStates(
        (states) => ({
          ...states,
          [name]:
            "AVAILABLE",
        })
      );
      return;
    }

    setSourceStates(
      (states) => ({
        ...states,
        [name]:
          "CONNECTING",
      })
    );

    setTimeout(() => {
      setSourceStates(
        (states) => ({
          ...states,
          [name]:
            "INDEXING",
        })
      );
    }, 700);

    setTimeout(() => {
      setSourceStates(
        (states) => ({
          ...states,
          [name]:
            "CONNECTED",
        })
      );
    }, 1800);
  }

  /* =========================================================
     RESET
  ========================================================= */

  function resetDemo() {
    localStorage.removeItem(
      "decipherer-v08"
    );

    setView("Today");
    setCompany("ALL");
    setWorkflow(null);
    setWorkflowState("idle");
    setChaos("");
    setDeciphered(false);
    setActiveAgent(
      "Chief of Staff"
    );
    setSelectedAgent(null);
    setChatInput("");
    setChatMessages([
      {
        role: "assistant",
        agent:
          "Chief of Staff",
        text:
          "I'm awake. Ask me about any company, decision, risk, account, product or open thread.",
      },
    ]);
    setMemories(initialMemory);
    setSourceStates({});
    setEvidenceOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F5F5F2] text-[#111722]">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#E4E4DF] bg-[#F8F8F6]/95 backdrop-blur">
        <div className="flex h-[72px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-5">
            <button
              onClick={() =>
                navigate("Today")
              }
              className="text-left"
            >
              <div className="text-[15px] font-black tracking-[0.18em]">
                DECIPHERER
              </div>

              <div className="text-[9px] font-medium tracking-wide text-[#81858E]">
                FOUNDER OPERATING LAYER
              </div>
            </button>

            <div className="hidden h-7 w-px bg-[#E0E0DB] lg:block" />

            <button
              onClick={() =>
                openAgentChat(
                  "Chief of Staff"
                )
              }
              className="hidden items-center gap-2 lg:flex"
            >
              <span className="h-2 w-2 rounded-full bg-[#25815B]" />

              <span className="text-xs font-semibold text-[#62666F]">
                Chief of Staff awake
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setEvidenceOpen(true)
              }
              className="rounded-lg border border-[#DDDDD8] bg-white px-3 py-2 text-xs font-bold"
            >
              Evidence
            </button>

            <button
              onClick={resetDemo}
              className="rounded-lg border border-[#DDDDD8] bg-white px-3 py-2 text-xs font-bold"
            >
              Reset Demo
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111722] text-xs font-black text-white">
              AR
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN LAYOUT
      ====================================================== */}

      <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[220px_minmax(0,1fr)_285px]">
        {/* ===================================================
            LEFT NAV
        ==================================================== */}

        <aside className="hidden border-r border-[#E4E4DF] bg-[#F8F8F6] p-4 lg:block">
          <div className="sticky top-[90px]">
            <div className="space-y-1">
              {(
                [
                  "Today",
                  "Command",
                  "Live",
                  "Companies",
                  "Memory",
                  "Sources",
                  "Control",
                ] as View[]
              ).map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    navigate(item)
                  }
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${
                    view === item
                      ? "bg-[#111722] text-white"
                      : "text-[#696D76] hover:bg-white"
                  }`}
                >
                  {item}

                  {item ===
                    "Live" && (
                    <span className="h-2 w-2 rounded-full bg-[#25815B]" />
                  )}

                  {item ===
                    "Memory" && (
                    <span className="text-[10px]">
                      {
                        memories.length
                      }
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-8 border-t border-[#E5E5E0] pt-5">
              <div className="px-3 text-[9px] font-black tracking-[0.15em] text-[#9A9CA2]">
                COMPANIES
              </div>

              <div className="mt-2 space-y-1">
                {companies
                  .filter(
                    (item) =>
                      item !== "ALL"
                  )
                  .map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setCompany(item);
                        navigate(
                          "Companies"
                        );
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#747780] hover:bg-white"
                    >
                      {item}
                    </button>
                  ))}
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-[#D9D9D4] bg-white p-4">
              <div className="text-[9px] font-black tracking-[0.12em] text-[#5955E7]">
                NIGHT SHIFT
              </div>

              <div className="mt-2 text-xl font-bold">
                8h 14m
              </div>

              <div className="mt-1 text-[11px] text-[#777B84]">
                operated while you were away
              </div>

              <button
                onClick={() =>
                  navigate("Live")
                }
                className="mt-4 text-xs font-bold text-[#5955E7]"
              >
                Replay night →
              </button>
            </div>
          </div>
        </aside>

        {/* ===================================================
            CENTER
        ==================================================== */}

        <main className="min-w-0 p-4 md:p-6 lg:p-8">
          {/* =================================================
              TODAY
          ================================================== */}

          {view === "Today" && (
            <>
              <section className="rounded-[26px] border border-[#E0E0DB] bg-white p-6 md:p-8">
                <div className="text-[10px] font-black tracking-[0.14em] text-[#5955E7]">
                  MORNING BRIEF
                </div>

                <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
                  Good morning,
                  Abhishek.
                </h1>

                <p className="mt-4 max-w-2xl text-lg leading-8 text-[#6B6F78]">
                  I kept watch while you
                  were away.
                </p>

                <div className="mt-8 flex flex-wrap items-end gap-8">
                  <div>
                    <div className="text-5xl font-semibold">
                      17
                    </div>

                    <div className="mt-1 text-sm text-[#777B84]">
                      things moved
                    </div>
                  </div>

                  <div>
                    <div className="text-5xl font-semibold text-[#25815B]">
                      11
                    </div>

                    <div className="mt-1 text-sm text-[#777B84]">
                      moved without you
                    </div>
                  </div>

                  <div>
                    <div className="text-5xl font-semibold text-[#C83D4D]">
                      1
                    </div>

                    <div className="mt-1 text-sm text-[#777B84]">
                      actually needs you
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-[#E5E5E0] bg-[#F8F8F6] p-5">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <div className="text-[10px] font-black tracking-[0.12em] text-[#C83D4D]">
                        NEEDS ABHISHEK · 3 MIN
                      </div>

                      <h3 className="mt-2 text-lg font-bold">
                        Xalen commercial
                        truth needs one
                        canonical state.
                      </h3>

                      <p className="mt-2 text-sm text-[#777B84]">
                        Truthkeeper did
                        the investigation.
                        Only authority is
                        missing.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        openWorkflow(
                          "truthkeeper"
                        )
                      }
                      className="rounded-xl bg-[#111722] px-5 py-3 text-sm font-bold text-white"
                    >
                      Review decision →
                    </button>
                  </div>
                </div>
              </section>

              {/* CHIEF OF STAFF */}

              <section className="mt-5 rounded-[26px] border border-[#DADAE3] bg-[#171B25] p-6 text-white md:p-8">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#72E0AE]" />

                      <span className="text-[10px] font-black tracking-[0.14em] text-[#A9ACB5]">
                        CHIEF OF STAFF AGENT
                      </span>
                    </div>

                    <h2 className="mt-3 text-2xl font-semibold">
                      Give me anything.
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#B9BBC4]">
                      Ask across every
                      company, meeting,
                      account, report,
                      decision or open
                      thread.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveAgent(
                        "Chief of Staff"
                      );
                      navigate(
                        "Command"
                      );
                    }}
                    className="text-xs font-bold text-[#BEBBFF]"
                  >
                    Open full command →
                  </button>
                </div>

                <div className="mt-6 flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
                  <input
                    value={chatInput}
                    onChange={(event) =>
                      setChatInput(
                        event.target.value
                      )
                    }
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        setActiveAgent(
                          "Chief of Staff"
                        );
                        sendChat();
                      }
                    }}
                    placeholder="What changed while I slept?"
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-[#7C808B]"
                  />

                  <button
                    onClick={() => {
                      setActiveAgent(
                        "Chief of Staff"
                      );
                      sendChat();
                    }}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#111722]"
                  >
                    Ask
                  </button>
                </div>

                {chatMessages.length >
                  1 && (
                  <div className="mt-4 rounded-xl bg-white/5 p-4 text-sm leading-6 text-[#D8D9DE]">
                    {
                      chatMessages[
                        chatMessages.length -
                          1
                      ].text
                    }
                  </div>
                )}
              </section>

              {/* CHAOS */}

              <section className="mt-5 rounded-[26px] border border-[#E0E0DB] bg-white p-6 md:p-8">
                <div className="text-[10px] font-black tracking-[0.14em] text-[#5955E7]">
                  GIVE ME CHAOS
                </div>

                <h2 className="mt-2 text-2xl font-semibold">
                  Drop the founder brain
                  dump.
                </h2>

                <p className="mt-2 text-sm text-[#777B84]">
                  Conversation, report,
                  URL, voice note,
                  problem, opportunity or
                  half-formed thought.
                </p>

                <textarea
                  value={chaos}
                  onChange={(event) =>
                    setChaos(
                      event.target.value
                    )
                  }
                  className="mt-5 min-h-28 w-full resize-none rounded-2xl border border-[#E1E1DC] bg-[#FAFAF8] p-4 text-sm leading-6 outline-none focus:border-[#5955E7]"
                  placeholder="We have too many things moving across Xalen, Vedika and BookMyMandir..."
                />

                <button
                  onClick={
                    decipherChaos
                  }
                  disabled={
                    deciphering
                  }
                  className="mt-4 rounded-xl bg-[#111722] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {deciphering
                    ? "Deciphering…"
                    : "Decipher →"}
                </button>

                {deciphered && (
                  <div
                    ref={
                      chaosResultRef
                    }
                    className="mt-7 scroll-mt-28 rounded-2xl border border-[#D8E8DF] bg-[#F5FAF7] p-6"
                  >
                    <div className="text-[10px] font-black tracking-[0.13em] text-[#25815B]">
                      DECIPHERED
                    </div>

                    <h3 className="mt-2 text-2xl font-semibold">
                      Four missions
                      identified.
                    </h3>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {[
                        {
                          title:
                            "Canonicalise Xalen commercial truth",
                          agent:
                            "Truthkeeper",
                          workflow:
                            "truthkeeper" as const,
                        },
                        {
                          title:
                            "Rank BookMyMandir's next 10 tools",
                          agent:
                            "Product Radar",
                          workflow:
                            "prioritizer" as const,
                        },
                        {
                          title:
                            "Find Vedika accounts worth graduating",
                          agent:
                            "Revenue Intelligence",
                          workflow:
                            "graduation" as const,
                        },
                        {
                          title:
                            "Resolve shared capability ownership",
                          agent:
                            "Dependency Agent",
                          workflow:
                            "dependency" as const,
                        },
                      ].map(
                        (mission) => (
                          <button
                            key={
                              mission.title
                            }
                            onClick={() =>
                              openWorkflow(
                                mission.workflow
                              )
                            }
                            className="rounded-xl border border-[#DDE6E1] bg-white p-4 text-left"
                          >
                            <div className="font-bold">
                              {
                                mission.title
                              }
                            </div>

                            <div className="mt-2 text-xs font-semibold text-[#5955E7]">
                              {
                                mission.agent
                              }{" "}
                              →
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {/* =================================================
              COMMAND
          ================================================== */}

          {view === "Command" && (
            <section className="mx-auto max-w-4xl">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${statusDot(
                        currentAgent.status
                      )}`}
                    />

                    <div className="text-[10px] font-black tracking-[0.14em] text-[#5955E7]">
                      TALKING TO
                    </div>
                  </div>

                  <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    {activeAgent}
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6F737B]">
                    {
                      currentAgent.mission
                    }
                  </p>
                </div>

                {activeAgent !==
                  "Chief of Staff" && (
                  <button
                    onClick={
                      returnToChiefOfStaff
                    }
                    className="rounded-xl border border-[#DCDCD7] bg-white px-4 py-2.5 text-xs font-bold"
                  >
                    ← Return to Chief of Staff
                  </button>
                )}
              </div>

              <div className="mt-8 rounded-[26px] border border-[#DEDED9] bg-white">
                <div className="border-b border-[#ECECE8] px-5 py-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <span className="font-bold">
                      {
                        currentAgent.role
                      }
                    </span>

                    <span className="text-[#AAA]">
                      ·
                    </span>

                    <span className="text-[#777B84]">
                      {
                        currentAgent.company
                      }
                    </span>

                    <span className="text-[#AAA]">
                      ·
                    </span>

                    <span className="font-bold text-[#5955E7]">
                      {
                        currentAgent.autonomy
                      }
                    </span>
                  </div>
                </div>

                <div className="min-h-[480px] p-5 md:p-6">
                  <div className="space-y-4">
                    {chatMessages.map(
                      (
                        message,
                        index
                      ) => {
                        if (
                          message.role ===
                          "system"
                        ) {
                          return (
                            <div
                              key={
                                index
                              }
                              className="flex justify-center"
                            >
                              <div className="rounded-full bg-[#F0EFFF] px-3 py-1.5 text-[10px] font-black text-[#5955E7]">
                                {
                                  message.text
                                }
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={
                              index
                            }
                            className={`flex ${
                              message.role ===
                              "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                                message.role ===
                                "user"
                                  ? "bg-[#111722] text-white"
                                  : "bg-[#F3F3F0] text-[#30343C]"
                              }`}
                            >
                              {message.role ===
                                "assistant" &&
                                message.agent && (
                                  <div className="mb-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#777B84]">
                                    {
                                      message.agent
                                    }
                                  </div>
                                )}

                              {
                                message.text
                              }
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div
                    ref={
                      commandBottomRef
                    }
                  />
                </div>

                <div className="sticky bottom-0 border-t border-[#ECECE8] bg-white p-4">
                  <div className="flex gap-2 rounded-2xl border border-[#DDD] bg-[#FAFAF8] p-2">
                    <input
                      value={chatInput}
                      onChange={(
                        event
                      ) =>
                        setChatInput(
                          event.target
                            .value
                        )
                      }
                      onKeyDown={(
                        event
                      ) => {
                        if (
                          event.key ===
                          "Enter"
                        ) {
                          sendChat();
                        }
                      }}
                      className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
                      placeholder={`Ask ${activeAgent}...`}
                    />

                    <button
                      onClick={() =>
                        sendChat()
                      }
                      className="rounded-xl bg-[#111722] px-5 py-3 text-sm font-bold text-white"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(activeAgent ===
                  "Chief of Staff"
                  ? [
                      "What changed overnight?",
                      "What should I be worried about?",
                      "Which Vedika account needs me?",
                      "What should BookMyMandir build next?",
                    ]
                  : activeAgent ===
                    "Revenue Intelligence"
                  ? [
                      "Why TempleStack?",
                      "Who deserves founder attention?",
                      "Should pricing change?",
                    ]
                  : activeAgent ===
                    "Product Radar"
                  ? [
                      "What should ship next?",
                      "Why onboarding first?",
                      "What about voice onboarding?",
                    ]
                  : activeAgent ===
                    "Truthkeeper"
                  ? [
                      "What is conflicting?",
                      "What is your proposed truth?",
                      "Should we change pricing?",
                    ]
                  : [
                      "What is unresolved?",
                      "What needs the founder?",
                      "What should happen next?",
                    ]
                ).map(
                  (prompt) => (
                    <button
                      key={prompt}
                      onClick={() =>
                        sendChat(
                          prompt
                        )
                      }
                      className="rounded-full border border-[#DDD] bg-white px-3 py-2 text-xs font-semibold text-[#686C74]"
                    >
                      {prompt}
                    </button>
                  )
                )}
              </div>
            </section>
          )}

          {/* =================================================
              LIVE
          ================================================== */}

          {view === "Live" && (
            <>
              <section>
                <div className="text-[10px] font-black tracking-[0.14em] text-[#5955E7]">
                  NIGHT SHIFT
                </div>

                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                  What happened while you
                  were away.
                </h1>

                <div className="mt-7 grid gap-3 sm:grid-cols-4">
                  {[
                    [
                      "23",
                      "signals processed",
                    ],
                    [
                      "11",
                      "investigated",
                    ],
                    [
                      "7",
                      "resolved",
                    ],
                    [
                      "2",
                      "need founder",
                    ],
                  ].map(
                    ([
                      value,
                      label,
                    ]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-[#E0E0DB] bg-white p-5"
                      >
                        <div className="text-3xl font-semibold">
                          {value}
                        </div>

                        <div className="mt-1 text-xs text-[#777B84]">
                          {label}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>

              <section className="mt-7 overflow-hidden rounded-[26px] border border-[#E0E0DB] bg-white">
                {nightShiftEvents.map(
                  (
                    event,
                    index
                  ) => (
                    <div
                      key={`${event.time}-${event.title}`}
                      className={`grid gap-4 p-6 md:grid-cols-[70px_180px_1fr_130px] ${
                        index !==
                        nightShiftEvents.length -
                          1
                          ? "border-b border-[#ECECE8]"
                          : ""
                      }`}
                    >
                      <div className="font-mono text-sm font-bold text-[#777B84]">
                        {
                          event.time
                        }
                      </div>

                      <button
                        onClick={() =>
                          openAgentChat(
                            event.agent as AgentName
                          )
                        }
                        className="text-left"
                      >
                        <div className="text-xs font-bold">
                          {
                            event.agent
                          }
                        </div>

                        <div className="mt-1 text-[10px] font-black text-[#999BA1]">
                          {
                            event.company
                          }
                        </div>
                      </button>

                      <div>
                        <div className="font-bold">
                          {
                            event.title
                          }
                        </div>

                        <p className="mt-1 text-sm leading-6 text-[#777B84]">
                          {
                            event.outcome
                          }
                        </p>
                      </div>

                      <div className="md:text-right">
                        <span
                          className={`rounded-full px-3 py-1.5 text-[10px] font-black ${
                            event.founder
                              ? "bg-[#FFF0F2] text-[#C83D4D]"
                              : "bg-[#EDF8F1] text-[#25815B]"
                          }`}
                        >
                          {event.founder
                            ? "NEEDS FOUNDER"
                            : "HANDLED"}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </section>
            </>
          )}

          {/* =================================================
              COMPANIES
          ================================================== */}

          {view ===
            "Companies" && (
            <>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {companies.map(
                  (item) => (
                    <button
                      key={item}
                      onClick={() =>
                        setCompany(item)
                      }
                      className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold ${
                        company ===
                        item
                          ? "border-[#111722] bg-[#111722] text-white"
                          : "border-[#DDD] bg-white text-[#70747C]"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>

              {company === "ALL" ? (
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {(
                    Object.keys(
                      companyFacts
                    ) as Exclude<
                      Company,
                      "ALL"
                    >[]
                  ).map((key) => {
                    const item =
                      companyFacts[key];

                    return (
                      <button
                        key={key}
                        onClick={() =>
                          setCompany(key)
                        }
                        className="rounded-[24px] border border-[#E0E0DB] bg-white p-6 text-left"
                      >
                        <div className="text-[10px] font-black tracking-[0.13em] text-[#5955E7]">
                          COMPANY BRAIN
                        </div>

                        <h2 className="mt-2 text-2xl font-semibold">
                          {
                            item.name
                          }
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-[#747780]">
                          {
                            item.description
                          }
                        </p>

                        <div className="mt-5 text-xs font-bold text-[#5955E7]">
                          Open context →
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                activeCompany && (
                  <>
                    <section className="mt-8 rounded-[26px] border border-[#E0E0DB] bg-white p-7">
                      <div className="text-[10px] font-black tracking-[0.13em] text-[#5955E7]">
                        COMPANY BRAIN
                      </div>

                      <h1 className="mt-2 text-4xl font-semibold">
                        {
                          activeCompany.name
                        }
                      </h1>

                      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#70747C]">
                        {
                          activeCompany.description
                        }
                      </p>

                      <div className="mt-7 grid gap-3 md:grid-cols-2">
                        {activeCompany.facts.map(
                          (fact) => (
                            <div
                              key={
                                fact
                              }
                              className="rounded-xl border border-[#E5E5E0] bg-[#FAFAF8] p-4"
                            >
                              <span className="text-[9px] font-black text-[#326FC2]">
                                PUBLIC FACT
                              </span>

                              <p className="mt-2 text-sm font-semibold">
                                {fact}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </section>

                    <section className="mt-5 rounded-[26px] border border-[#E0E0DB] bg-white p-7">
                      <div className="text-[10px] font-black tracking-[0.13em] text-[#C83D4D]">
                        BEST NEXT AGENT
                      </div>

                      <h2 className="mt-2 text-2xl font-semibold">
                        {company ===
                        "BOOKMYMANDIR"
                          ? "Product Radar"
                          : company ===
                            "VEDIKA"
                          ? "Revenue Intelligence"
                          : company ===
                            "XALEN"
                          ? "Truthkeeper"
                          : "Chief of Staff"}
                      </h2>

                      <button
                        onClick={() => {
                          if (
                            company ===
                            "BOOKMYMANDIR"
                          )
                            openWorkflow(
                              "prioritizer"
                            );
                          else if (
                            company ===
                            "VEDIKA"
                          )
                            openWorkflow(
                              "graduation"
                            );
                          else if (
                            company ===
                            "XALEN"
                          )
                            openWorkflow(
                              "truthkeeper"
                            );
                          else
                            openAgentChat(
                              "Chief of Staff"
                            );
                        }}
                        className="mt-5 rounded-xl bg-[#111722] px-5 py-3 text-sm font-bold text-white"
                      >
                        Run workflow →
                      </button>
                    </section>
                  </>
                )
              )}
            </>
          )}

          {/* =================================================
              MEMORY
          ================================================== */}

          {view === "Memory" && (
            <>
              <section>
                <div className="text-[10px] font-black tracking-[0.14em] text-[#5955E7]">
                  FOUNDER MEMORY
                </div>

                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                  Remember why, not just
                  what.
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6F737B]">
                  Decisions, assumptions
                  and reopening conditions
                  become institutional
                  memory instead of
                  disappearing into chat
                  history.
                </p>
              </section>

              <div className="mt-7 space-y-3">
                {memories.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="rounded-[22px] border border-[#E0E0DB] bg-white p-6"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-[#F0EFFF] px-2 py-1 text-[9px] font-black text-[#5955E7]">
                          {
                            item.type
                          }
                        </span>

                        <span className="text-[10px] font-black text-[#95989F]">
                          {
                            item.company
                          }
                        </span>

                        <span className="text-[10px] font-black text-[#B1B3B7]">
                          {
                            item.date
                          }
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold">
                        {
                          item.title
                        }
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[#70747C]">
                        {
                          item.detail
                        }
                      </p>

                      <div className="mt-4 rounded-xl bg-[#F7F7F4] p-4">
                        <div className="text-[9px] font-black text-[#999BA1]">
                          REOPEN WHEN
                        </div>

                        <div className="mt-2 text-xs font-semibold">
                          {
                            item.reopen
                          }
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}

          {/* =================================================
              SOURCES
          ================================================== */}

          {view === "Sources" && (
            <>
              <section>
                <div className="text-[10px] font-black tracking-[0.14em] text-[#5955E7]">
                  COMPANY INPUTS
                </div>

                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                  Teach DECIPHERER how
                  your company actually
                  works.
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6F737B]">
                  Connect operational
                  systems or simply drop a
                  report, transcript,
                  spreadsheet or document.
                  Raw information becomes
                  signals, investigations,
                  decisions and memory.
                </p>
              </section>

              <div className="mt-7 grid gap-3 md:grid-cols-2">
                {sourceCatalog.map(
                  (source) => {
                    const state =
                      sourceStates[
                        source.name
                      ] ??
                      "AVAILABLE";

                    return (
                      <div
                        key={
                          source.name
                        }
                        className="rounded-[22px] border border-[#E0E0DB] bg-white p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-bold">
                              {
                                source.name
                              }
                            </div>

                            <div className="mt-1 text-[10px] font-black text-[#999BA1]">
                              {
                                source.type
                              }
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[9px] font-black ${
                              state ===
                              "CONNECTED"
                                ? "bg-[#EDF8F1] text-[#25815B]"
                                : state ===
                                  "INDEXING"
                                ? "bg-[#F0EFFF] text-[#5955E7]"
                                : state ===
                                  "CONNECTING"
                                ? "bg-[#FFF5E4] text-[#A66A0E]"
                                : "bg-[#F1F1EF] text-[#777B84]"
                            }`}
                          >
                            {state}
                          </span>
                        </div>

                        <p className="mt-4 text-xs leading-5 text-[#777B84]">
                          {
                            source.detail
                          }
                        </p>

                        {state ===
                          "CONNECTING" && (
                          <div className="mt-5 rounded-xl bg-[#FFF8EB] p-4 text-xs font-bold text-[#A66A0E]">
                            Authenticating
                            connection…
                          </div>
                        )}

                        {state ===
                          "INDEXING" && (
                          <div className="mt-5 rounded-xl bg-[#F4F2FF] p-4">
                            <div className="text-xs font-bold text-[#5955E7]">
                              Reading company
                              context…
                            </div>

                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E5E2FF]">
                              <div className="h-full w-2/3 animate-pulse rounded-full bg-[#5955E7]" />
                            </div>
                          </div>
                        )}

                        {state ===
                          "CONNECTED" && (
                          <div className="mt-5 rounded-xl border border-[#D8E9DF] bg-[#F3FAF6] p-4">
                            <div className="text-[9px] font-black text-[#25815B]">
                              INGESTION COMPLETE
                            </div>

                            <div className="mt-2 text-xs font-bold">
                              {
                                source.indexed
                              }
                            </div>

                            <div className="mt-1 text-xs text-[#607269]">
                              {
                                source.signals
                              }
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() =>
                            connectSource(
                              source.name
                            )
                          }
                          disabled={
                            state ===
                              "CONNECTING" ||
                            state ===
                              "INDEXING"
                          }
                          className={`mt-5 rounded-lg px-4 py-2 text-xs font-bold disabled:cursor-wait disabled:opacity-60 ${
                            state ===
                            "CONNECTED"
                              ? "border border-[#DDD] bg-white"
                              : "bg-[#111722] text-white"
                          }`}
                        >
                          {state ===
                          "CONNECTED"
                            ? "Disconnect demo"
                            : state ===
                              "CONNECTING"
                            ? "Connecting…"
                            : state ===
                              "INDEXING"
                            ? "Indexing…"
                            : "Connect demo"}
                        </button>
                      </div>
                    );
                  }
                )}
              </div>

              <section className="mt-5 rounded-[26px] border border-dashed border-[#CFCFC9] bg-white p-8 text-center">
                <div className="text-3xl">
                  ↑
                </div>

                <h3 className="mt-3 text-xl font-bold">
                  Or drop something here.
                </h3>

                <p className="mt-2 text-sm text-[#777B84]">
                  PDF · Excel · transcript
                  · weekly report ·
                  investor update · CRM
                  export
                </p>

                <button
                  onClick={() => {
                    setSourceStates(
                      (current) => ({
                        ...current,
                        "Uploaded file":
                          "INDEXING",
                      })
                    );

                    setTimeout(() => {
                      setSourceStates(
                        (current) => ({
                          ...current,
                          "Uploaded file":
                            "CONNECTED",
                        })
                      );
                    }, 1600);
                  }}
                  className="mt-5 rounded-xl bg-[#111722] px-5 py-3 text-sm font-bold text-white"
                >
                  Simulate file upload
                </button>

                {sourceStates[
                  "Uploaded file"
                ] === "INDEXING" && (
                  <div className="mx-auto mt-5 max-w-md rounded-xl bg-[#F4F2FF] p-4 text-sm font-bold text-[#5955E7]">
                    Reading report →
                    extracting facts →
                    finding commitments →
                    mapping decisions…
                  </div>
                )}

                {sourceStates[
                  "Uploaded file"
                ] ===
                  "CONNECTED" && (
                  <div className="mx-auto mt-5 max-w-md rounded-xl border border-[#D8E9DF] bg-[#F3FAF6] p-4 text-left">
                    <div className="text-[9px] font-black text-[#25815B]">
                      ADDED TO COMPANY BRAIN
                    </div>

                    <div className="mt-2 text-sm font-bold">
                      73 pages read
                    </div>

                    <div className="mt-2 text-xs leading-5 text-[#607269]">
                      14 facts · 6
                      decisions · 9 open
                      commitments · 3
                      contradictions · 4
                      risks
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {/* =================================================
              CONTROL
          ================================================== */}

          {view === "Control" && (
            <>
              <section>
                <div className="text-[10px] font-black tracking-[0.14em] text-[#5955E7]">
                  AUTONOMY CONTROL
                </div>

                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                  Agents get authority,
                  not unlimited freedom.
                </h1>
              </section>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {[
                  {
                    level: "01",
                    title: "Observe",
                    detail:
                      "Read context and detect signals. Never change anything.",
                  },
                  {
                    level: "02",
                    title:
                      "Investigate",
                    detail:
                      "Pull evidence, compare sources and determine root cause.",
                  },
                  {
                    level: "03",
                    title: "Prepare",
                    detail:
                      "Draft actions, plans, communications and decisions.",
                  },
                  {
                    level: "04",
                    title: "Execute",
                    detail:
                      "Take pre-approved low-risk actions and verify outcomes.",
                  },
                ].map(
                  (item) => (
                    <div
                      key={
                        item.level
                      }
                      className="rounded-[22px] border border-[#E0E0DB] bg-white p-6"
                    >
                      <div className="text-[10px] font-black text-[#999BA1]">
                        LEVEL{" "}
                        {
                          item.level
                        }
                      </div>

                      <h3 className="mt-2 text-xl font-bold">
                        {
                          item.title
                        }
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[#777B84]">
                        {
                          item.detail
                        }
                      </p>
                    </div>
                  )
                )}
              </div>

              <section className="mt-5 rounded-[26px] border border-[#E0E0DB] bg-white p-6">
                <div className="text-[10px] font-black tracking-[0.13em] text-[#C83D4D]">
                  FOUNDER GATES
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    "Enterprise pricing changes",
                    "Hiring offers",
                    "Contracts / legal commitments",
                    "Company-level ownership changes",
                    "High-value strategic customer commitments",
                  ].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-xl bg-[#FAFAF8] p-4"
                      >
                        <span className="text-sm font-semibold">
                          {item}
                        </span>

                        <span className="text-[10px] font-black text-[#C83D4D]">
                          FOUNDER REQUIRED
                        </span>
                      </div>
                    )
                  )}
                </div>
              </section>
            </>
          )}

          {/* =================================================
              WORKFLOW
          ================================================== */}

          {workflow && (
            <section
              ref={workflowRef}
              className="mt-6 scroll-mt-28 overflow-hidden rounded-[26px] border border-[#D8D8E1] bg-white"
            >
              <div className="flex items-start justify-between border-b border-[#ECECE8] p-6">
                <div>
                  <div className="text-[10px] font-black tracking-[0.13em] text-[#5955E7]">
                    {workflow ===
                    "truthkeeper"
                      ? "TRUTHKEEPER"
                      : workflow ===
                        "prioritizer"
                      ? "PRODUCT RADAR"
                      : workflow ===
                        "graduation"
                      ? "REVENUE INTELLIGENCE"
                      : "DEPENDENCY AGENT"}
                  </div>

                  <h2 className="mt-2 text-2xl font-semibold">
                    {workflow ===
                    "truthkeeper"
                      ? "Resolve canonical commercial truth."
                      : workflow ===
                        "prioritizer"
                      ? "Which BookMyMandir tools should ship next?"
                      : workflow ===
                        "graduation"
                      ? "Who deserves enterprise attention?"
                      : "Where is the founder still the integration layer?"}
                  </h2>
                </div>

                <button
                  onClick={() =>
                    setWorkflow(null)
                  }
                  className="rounded-lg border border-[#DDD] px-3 py-2 text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <div className="grid lg:grid-cols-[1fr_320px]">
                <div className="p-6">
                  {workflow ===
                    "truthkeeper" && (
                    <>
                      <div className="space-y-2">
                        {[
                          [
                            "Pricing",
                            "Wallet-backed PAYG and enterprise scoping",
                          ],
                          [
                            "Studio",
                            "Subscription cards remain visible",
                          ],
                          [
                            "Migration",
                            "Studio subscriptions unavailable during migration",
                          ],
                        ].map(
                          ([
                            source,
                            claim,
                          ]) => (
                            <div
                              key={
                                source
                              }
                              className="grid gap-3 rounded-xl border border-[#E5E5E0] p-4 md:grid-cols-[120px_1fr]"
                            >
                              <div className="text-xs font-bold">
                                {
                                  source
                                }
                              </div>

                              <div className="text-xs text-[#747780]">
                                {
                                  claim
                                }
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {(workflowState ===
                        "returned" ||
                        workflowState ===
                          "approved") && (
                        <div className="mt-6 rounded-xl bg-[#F1F9F5] p-5">
                          <div className="text-[10px] font-black text-[#25815B]">
                            AGENT RETURN
                          </div>

                          <h3 className="mt-2 text-lg font-bold">
                            Proposed
                            canonical state
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-[#65746B]">
                            PAYG remains
                            available.
                            Enterprise
                            remains scoped.
                            Studio should
                            remain migration
                            / unavailable
                            until canonical
                            state changes.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {workflow ===
                    "prioritizer" &&
                    (workflowState ===
                      "returned" ||
                      workflowState ===
                        "approved") && (
                      <div className="overflow-hidden rounded-xl border border-[#E5E5E0]">
                        {bmmTools.map(
                          (
                            item,
                            index
                          ) => (
                            <div
                              key={
                                item.tool
                              }
                              className={`grid gap-3 p-4 md:grid-cols-[50px_1fr_60px] ${
                                index !==
                                bmmTools.length -
                                  1
                                  ? "border-b border-[#ECECE8]"
                                  : ""
                              }`}
                            >
                              <div className="text-xl font-bold text-[#A3A5AB]">
                                {String(
                                  item.rank
                                ).padStart(
                                  2,
                                  "0"
                                )}
                              </div>

                              <div>
                                <div className="font-bold">
                                  {
                                    item.tool
                                  }
                                </div>

                                <p className="mt-1 text-xs leading-5 text-[#777B84]">
                                  {
                                    item.detail
                                  }
                                </p>
                              </div>

                              <div
                                className={`text-right text-xl font-bold ${scoreColor(
                                  item.score
                                )}`}
                              >
                                {
                                  item.score
                                }
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}

                  {workflow ===
                    "prioritizer" &&
                    (workflowState ===
                      "idle" ||
                      workflowState ===
                        "running") && (
                      <div className="rounded-xl bg-[#F8F8F6] p-6">
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            "21 Verified",
                            "59 Source",
                            "1 Beta",
                            "1 Foundation",
                            "18 Not built",
                          ].map(
                            (item) => (
                              <div
                                key={
                                  item
                                }
                                className="rounded-lg bg-white p-3 text-center text-xs font-bold"
                              >
                                {
                                  item
                                }
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {workflow ===
                    "graduation" &&
                    (workflowState ===
                      "returned" ||
                      workflowState ===
                        "approved") && (
                      <div className="overflow-hidden rounded-xl border border-[#E5E5E0]">
                        {vedikaAccounts.map(
                          (
                            item,
                            index
                          ) => (
                            <div
                              key={
                                item.name
                              }
                              className={`grid gap-3 p-5 md:grid-cols-[150px_1fr_140px] ${
                                index !==
                                vedikaAccounts.length -
                                  1
                                  ? "border-b border-[#ECECE8]"
                                  : ""
                              }`}
                            >
                              <div>
                                <div className="font-bold">
                                  {
                                    item.name
                                  }
                                </div>

                                <div className="mt-1 text-[10px] text-[#999BA1]">
                                  Intent{" "}
                                  {
                                    item.intent
                                  }
                                </div>
                              </div>

                              <p className="text-xs leading-5 text-[#777B84]">
                                {
                                  item.reason
                                }
                              </p>

                              <div className="md:text-right">
                                <span className="rounded bg-[#F0EFFF] px-3 py-2 text-xs font-bold text-[#5955E7]">
                                  {
                                    item.recommendation
                                  }
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}

                  {workflow ===
                    "graduation" &&
                    (workflowState ===
                      "idle" ||
                      workflowState ===
                        "running") && (
                      <div className="rounded-xl bg-[#F8F8F6] p-6">
                        <div className="text-[10px] font-black text-[#999BA1]">
                          SIGNAL MODEL
                        </div>

                        <div className="mt-4 grid grid-cols-5 gap-2">
                          {[
                            "Sandbox",
                            "API usage",
                            "Feature need",
                            "Support",
                            "Intent",
                          ].map(
                            (item) => (
                              <div
                                key={
                                  item
                                }
                                className="rounded-lg bg-white p-3 text-center text-xs font-bold"
                              >
                                {
                                  item
                                }
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {workflow ===
                    "dependency" &&
                    (workflowState ===
                      "returned" ||
                      workflowState ===
                        "approved") && (
                      <div className="overflow-hidden rounded-xl border border-[#E5E5E0]">
                        {dependencyItems.map(
                          (
                            item,
                            index
                          ) => (
                            <div
                              key={
                                item.capability
                              }
                              className={`grid gap-4 p-5 md:grid-cols-[160px_1fr] ${
                                index !==
                                dependencyItems.length -
                                  1
                                  ? "border-b border-[#ECECE8]"
                                  : ""
                              }`}
                            >
                              <div>
                                <div className="font-bold">
                                  {
                                    item.capability
                                  }
                                </div>

                                <div className="mt-2 text-[9px] font-black text-[#C83D4D]">
                                  OWNER:{" "}
                                  {
                                    item.owner
                                  }
                                </div>
                              </div>

                              <div>
                                <div className="text-xs font-bold">
                                  {
                                    item.companies
                                  }
                                </div>

                                <p className="mt-2 text-xs leading-5 text-[#777B84]">
                                  {
                                    item.recommendation
                                  }
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}

                  {workflow ===
                    "dependency" &&
                    (workflowState ===
                      "idle" ||
                      workflowState ===
                        "running") && (
                      <div className="rounded-xl bg-[#F8F8F6] p-6">
                        <div className="text-sm font-semibold text-[#747780]">
                          Scanning shared
                          capabilities,
                          duplicated
                          decisions and
                          ownership gaps.
                        </div>
                      </div>
                    )}

                  {workflowState ===
                    "approved" && (
                    <div className="mt-5 rounded-xl border border-[#CEE7D9] bg-[#F1FAF5] p-5">
                      <div className="text-[10px] font-black text-[#25815B]">
                        OUTCOME RECORDED
                      </div>

                      <h3 className="mt-2 font-bold">
                        Founder Memory
                        updated.
                      </h3>

                      <p className="mt-1 text-xs text-[#61746A]">
                        The decision will
                        reopen if its
                        condition changes.
                      </p>
                    </div>
                  )}
                </div>

                <aside className="border-t border-[#ECECE8] bg-[#FAFAF8] p-6 lg:border-l lg:border-t-0">
                  <div className="text-[10px] font-black tracking-[0.13em] text-[#C83D4D]">
                    WHY ABHISHEK?
                  </div>

                  <p className="mt-3 text-xs leading-5 text-[#70747C]">
                    The agent can
                    investigate and
                    prepare. Founder
                    authority is requested
                    only where the system
                    cannot safely resolve
                    the decision itself.
                  </p>

                  {workflowState ===
                    "idle" && (
                    <button
                      onClick={
                        runWorkflow
                      }
                      className="mt-6 w-full rounded-xl bg-[#111722] px-4 py-3 text-sm font-bold text-white"
                    >
                      Run agent
                    </button>
                  )}

                  {workflowState ===
                    "running" && (
                    <div className="mt-6 rounded-xl bg-[#F0EFFF] p-4 text-sm font-bold text-[#5955E7]">
                      Agent working…
                    </div>
                  )}

                  {workflowState ===
                    "returned" && (
                    <button
                      onClick={
                        approveWorkflow
                      }
                      className="mt-6 w-full rounded-xl bg-[#111722] px-4 py-3 text-sm font-bold text-white"
                    >
                      Approve & execute
                    </button>
                  )}

                  {workflowState ===
                    "approved" && (
                    <div className="mt-6 rounded-xl bg-[#EDF8F1] p-4">
                      <div className="font-bold text-[#25815B]">
                        Closed with
                        evidence.
                      </div>
                    </div>
                  )}
                </aside>
              </div>
            </section>
          )}
        </main>

        {/* ===================================================
            LIVE AGENT RAIL
        ==================================================== */}

        <aside className="hidden border-l border-[#E4E4DF] bg-[#F8F8F6] p-4 xl:block">
          <div className="sticky top-[90px]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[9px] font-black tracking-[0.14em] text-[#999BA1]">
                  LIVE AGENTS
                </div>

                <div className="mt-1 text-sm font-bold">
                  6 awake
                </div>
              </div>

              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#25815B]" />
            </div>

            <div className="mt-4 space-y-2">
              {agents.map(
                (agent) => (
                  <button
                    key={
                      agent.name
                    }
                    onClick={() =>
                      setSelectedAgent(
                        agent
                      )
                    }
                    className="w-full rounded-xl border border-[#E4E4DF] bg-white p-3 text-left transition hover:border-[#C9C9D3]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold">
                        {
                          agent.name
                        }
                      </div>

                      <span
                        className={`h-2 w-2 rounded-full ${statusDot(
                          agent.status
                        )}`}
                      />
                    </div>

                    <div className="mt-1 text-[10px] text-[#777B84]">
                      {agent.role}
                    </div>

                    <div className="mt-2 text-[10px] leading-4 text-[#8D9097]">
                      {
                        agent.activity
                      }
                    </div>

                    <div className="mt-2 text-[9px] font-bold text-[#5955E7]">
                      {
                        agent.status
                      }
                    </div>
                  </button>
                )
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* =====================================================
          AGENT DRAWER
      ====================================================== */}

      {selectedAgent && (
        <div className="fixed inset-0 z-[100] bg-[#111722]/25">
          <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${statusDot(
                      selectedAgent.status
                    )}`}
                  />

                  <span className="text-[10px] font-black text-[#5955E7]">
                    {
                      selectedAgent.status
                    }
                  </span>
                </div>

                <h2 className="mt-3 text-2xl font-semibold">
                  {
                    selectedAgent.name
                  }
                </h2>

                <p className="mt-1 text-sm text-[#777B84]">
                  {
                    selectedAgent.role
                  }
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedAgent(
                    null
                  )
                }
                className="rounded-lg border border-[#DDD] px-3 py-2 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="mt-7 rounded-xl bg-[#F7F7F4] p-4">
              <div className="text-[9px] font-black text-[#999BA1]">
                CURRENT MISSION
              </div>

              <p className="mt-2 text-sm font-semibold leading-6">
                {
                  selectedAgent.mission
                }
              </p>
            </div>

            <div className="mt-3 rounded-xl bg-[#F7F7F4] p-4">
              <div className="text-[9px] font-black text-[#999BA1]">
                ACTIVITY
              </div>

              <p className="mt-2 text-sm font-semibold">
                {
                  selectedAgent.activity
                }
              </p>
            </div>

            <div className="mt-3 rounded-xl bg-[#F7F7F4] p-4">
              <div className="text-[9px] font-black text-[#999BA1]">
                AUTONOMY
              </div>

              <p className="mt-2 text-sm font-semibold text-[#5955E7]">
                {
                  selectedAgent.autonomy
                }
              </p>
            </div>

            <button
              onClick={() =>
                openAgentChat(
                  selectedAgent.name
                )
              }
              className="mt-7 w-full rounded-xl bg-[#111722] px-4 py-3 text-sm font-bold text-white"
            >
              Talk to{" "}
              {selectedAgent.name} →
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          EVIDENCE DRAWER
      ====================================================== */}

      {evidenceOpen && (
        <div className="fixed inset-0 z-[100] bg-[#111722]/25">
          <div className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-black tracking-[0.14em] text-[#5955E7]">
                  EVIDENCE LAYER
                </div>

                <h2 className="mt-2 text-2xl font-semibold">
                  What does DECIPHERER
                  actually know?
                </h2>
              </div>

              <button
                onClick={() =>
                  setEvidenceOpen(
                    false
                  )
                }
                className="rounded-lg border border-[#DDD] px-3 py-2 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#70747C]">
              The prototype separates
              public evidence,
              inference, synthetic demo
              data and internal company
              truth that would come from
              connected systems.
            </p>

            <div className="mt-7 space-y-3">
              {[
                {
                  type: "PUBLIC FACT",
                  detail:
                    "Externally verifiable product, pricing and company information.",
                },
                {
                  type:
                    "PUBLIC INFERENCE",
                  detail:
                    "Reasoned conclusion built from public evidence.",
                },
                {
                  type:
                    "DEMO INTERNAL",
                  detail:
                    "Synthetic account and operational data used to demonstrate workflows.",
                },
                {
                  type:
                    "INTERNAL TRUTH",
                  detail:
                    "CRM, reports, calls, Slack, docs, analytics and company systems once connected.",
                },
              ].map((item) => (
                <div
                  key={
                    item.type
                  }
                  className="rounded-xl border border-[#E1E1DC] p-4"
                >
                  <div className="text-xs font-bold">
                    {item.type}
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#777B84]">
                    {
                      item.detail
                    }
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setEvidenceOpen(
                  false
                );
                navigate(
                  "Sources"
                );
              }}
              className="mt-7 w-full rounded-xl bg-[#111722] px-4 py-3 text-sm font-bold text-white"
            >
              See data sources →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}