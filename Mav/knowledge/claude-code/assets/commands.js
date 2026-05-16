// Claude Code slash command registry — used by Modal to render details.
// Based on official changelog (as of 2026-05-12) and public docs.

window.CC_COMMANDS = {
  "/help": {
    tag: "会话保养",
    summary: "列出所有命令和快捷键。忘了就按它。",
    body: [
      { type: "p", text: "打开 Claude Code 后最值钱的命令。它不只列出命令名，还会把当前会话可用的所有斜杠命令、键盘快捷键、以及环境里注册的 Skill / Agent 都拉一份出来——比官网 cheat sheet 还全，因为它包含你自己加的自定义命令。" },
      { type: "h", text: "你会用到它的场景" },
      { type: "ul", items: [
        "忘了某个命令怎么写，又不想离开终端去搜。",
        "换机器或新项目，想看看这个环境里挂了哪些插件、Skill。",
        "想知道当前模式下哪些快捷键生效（vim 模式下会不同）。"
      ]},
      { type: "tip", text: "配合 ? 更好用：在输入框敲一个英文问号，会弹出一张压缩版的快捷键小抄。" }
    ]
  },
  "/status": {
    tag: "会话保养",
    summary: "显示当前模型、工作目录、账号、会话 ID 等状态。",
    body: [
      { type: "p", text: "一次性告诉你：现在是 Opus 还是 Sonnet、用的哪一档 effort、在哪个目录、是哪个账号、这次会话的 ID 是什么、权限模式（default / plan / auto / bypass）、有没有连 IDE、有没有 MCP 在跑。" },
      { type: "p", text: "当你突然发现 Claude 的反应不对劲——比如本来应该是 xhigh 却很快、或者明明设了 plan 却在改文件——第一步就是 /status。" },
      { type: "code", lang: "bash", text: "> /status\n\n  Model          claude-opus-4-7 (max effort)\n  Directory      ~/my-project\n  Account        zhangsan@mail.ustc.edu.cn (Pro)\n  Session        01JCF3...ab12\n  Mode           plan\n  IDE            VS Code (connected)\n  MCP servers    github (12 tools), postgres (6 tools)" }
    ]
  },
  "/context": {
    tag: "会话保养",
    summary: "查看上下文用了多少 token，哪些东西在吃内存。",
    body: [
      { type: "p", text: "上下文是 Claude 的短期记忆。它越满，Claude 越容易忘事、越容易漏掉你前面说的约束。/context 把它拆成几段：系统提示、CLAUDE.md、对话历史、工具结果、最近读的文件。" },
      { type: "p", text: "看到「工具结果」占了一半，大概率是某次读了一个几千行的日志或 dump 文件；这时候 /compact 一下就能省出大半。" },
      { type: "code", lang: "bash", text: "> /context\n\n  使用中  213k / 1,000k tokens  (21%)\n  ├── 系统提示       18k\n  ├── CLAUDE.md       3k\n  ├── 对话历史      142k\n  ├── 工具结果       49k\n  └── 最近读的文件    1k" }
    ]
  },
  "/compact": {
    tag: "会话保养",
    summary: "让 Claude 总结一下前面的对话，腾出上下文空间。",
    body: [
      { type: "p", text: "把前面几十轮来回压缩成几段摘要。摘要里保留任务目标、已完成的步骤、关键决定；丢掉的是中间翻了多少次文件、工具输出的原始内容。" },
      { type: "p", text: "可以带一个 focus 参数告诉它你在意什么：/compact 重点保留数据库迁移脚本里的字段映射。" },
      { type: "warn", text: "不要在关键任务到一半时 /compact。压缩会丢细节，十几个文件之间的交叉引用可能消失——让这段跑完再压。" }
    ]
  },
  "/clear": {
    tag: "会话保养",
    summary: "开一个全新的会话，彻底清空上下文。",
    body: [
      { type: "p", text: "不是压缩，是直接翻页。对话历史、工具结果、文件读过的记录——一键全清空。CLAUDE.md 这类「永久指令」还在。" },
      { type: "p", text: "什么时候 /clear 而不是 /compact？当你正在切换任务、上一件事的记忆反而会干扰新任务时。比如做完「重构登录」去改「导出报表」，清空更干净。" }
    ]
  },
  "/rewind": {
    tag: "会话保养",
    summary: "回到某个检查点，撤销代码改动和对话历史。",
    body: [
      { type: "p", text: "Claude Code 不只帮你撤销最后一步——它在每次重要操作前都悄悄打了检查点。/rewind 打开一个列表，每一项是一个时间点，选哪个回到哪个。" },
      { type: "p", text: "更常用的是键盘：连按两下 Esc 直接弹出 rewind 菜单，比打命令快。" },
      { type: "tip", text: "它同时回滚对话和文件。如果你只想回滚文件不回滚对话，用 git。如果只想回滚对话不回滚文件——目前做不到，/rewind 是整组撤销。" }
    ]
  },
  "/model": {
    tag: "模型",
    summary: "在 Opus / Sonnet / Haiku 之间切换。",
    body: [
      { type: "p", text: "Opus 最聪明也最贵，适合真正需要思考的任务：系统设计、难 bug、重构方案。Sonnet 平衡，日常改代码主力。Haiku 快而便宜，适合大量重复的小活（比如「给这 40 个函数加 JSDoc」）。" },
      { type: "p", text: "Opus 4.7 支持 1M token 上下文，读完一个中等项目不在话下。Sonnet 和 Haiku 仍是 200k。" },
      { type: "code", lang: "bash", text: "> /model sonnet\n  模型已切换到 claude-sonnet-4-6" }
    ]
  },
  "/effort": {
    tag: "模型",
    summary: "调推理强度，从 low 到 max，决定它想多久。",
    body: [
      { type: "p", text: "effort 不换模型，换的是「模型在每一步上花多少思考 token」。对同一个模型，max 级别能比 low 级别多用 10 倍以上的思考预算。" },
      { type: "table", rows: [
        ["low", "重复性改动、明确小修复", "快、便宜"],
        ["medium", "一般开发任务", "平衡"],
        ["high", "默认，跨文件任务", "慢一点，深度够"],
        ["xhigh", "复杂设计、难 bug（Opus 4.7 独有）", "显著更贵"],
        ["max", "真的卡住了，给它所有预算", "最贵"]
      ], head: ["级别", "适合", "代价"] },
      { type: "p", text: "2.1.111 起 /effort 打开会是一个可视化滑条，用方向键选、Enter 确认。" }
    ]
  },
  "/fast": {
    tag: "模型",
    summary: "切到快速模式，同一个 Opus 但输出更快。",
    body: [
      { type: "p", text: "别被名字骗了：/fast 不是「换到小模型」，它跑的还是 Opus，只是关掉了部分 xhigh 的深度思考换取响应速度。适合你知道任务不难、只是想快点看到结果。" },
      { type: "p", text: "在 Opus 4.6 和 4.7 上都可用。切回正常模式再敲一次 /fast 即可。" }
    ]
  },
  "/init": {
    tag: "记忆",
    summary: "扫项目一遍，自动生成一份 CLAUDE.md。",
    body: [
      { type: "p", text: "给新项目一键生成员工手册。它会读 package.json / pyproject.toml / Cargo.toml、看目录结构、扫 README、识别技术栈，最后输出一份草稿 CLAUDE.md：包含技术栈概览、常用命令、目录约定、不该碰的路径。" },
      { type: "p", text: "这份草稿不会完美——它是个起点。你读一遍，删掉不准确的、补上它不知道的（比如「我们的 API 必须先过 zod」），提交到项目。" },
      { type: "tip", text: "团队协作时，CLAUDE.md 要提交到 git。个人补充写在 CLAUDE.local.md，加到 .gitignore。" }
    ]
  },
  "/memory": {
    tag: "记忆",
    summary: "查看或编辑 CLAUDE.md 和 auto-memory。",
    body: [
      { type: "p", text: "打开一个面板，列出当前会话加载的所有 CLAUDE.md（可能有三层：~/.claude/、项目根、子目录），以及自动记忆系统存储的个人偏好。每一条可以就地编辑。" },
      { type: "p", text: "Auto-memory 是 Claude Code 的新能力：它会自己从你的交互中提炼偏好（「该用户习惯用 pnpm」「该用户写中文注释」），存到 ~/.claude/projects/.../memory/。/memory 就是你查看和修改这些记忆的地方。" }
    ]
  },
  "/permissions": {
    tag: "记忆",
    summary: "打开权限面板，管理允许/禁止的操作。",
    body: [
      { type: "p", text: "Claude 每次想跑「有副作用」的工具——写文件、跑命令、发请求——都要问你一次。对反复用的命令，你可以在这里加到白名单，之后就不问了。" },
      { type: "code", lang: "json", text: "{\n  \"permissions\": {\n    \"allow\": [\n      \"Bash(npm test *)\",\n      \"Bash(git status)\",\n      \"Bash(git diff *)\",\n      \"Read\",\n      \"mcp__github__*\"\n    ],\n    \"deny\": [\n      \"Bash(rm -rf *)\",\n      \"Bash(sudo *)\",\n      \"Write(.env)\",\n      \"mcp__slack__send_message\"\n    ]\n  }\n}" },
      { type: "p", text: "语法支持通配符：Bash(git *) 覆盖所有 git 子命令、mcp__github__* 覆盖所有 GitHub MCP 工具。" }
    ]
  },
  "/plan": {
    tag: "任务",
    summary: "进入计划模式，只读不改，先出方案再动手。",
    body: [
      { type: "p", text: "计划模式把 Claude 调成「只读」：可以读文件、跑 Grep、分析，不能写文件、不能跑 npm install / git commit 这类会产生副作用的命令。它产出一份方案，列出打算改什么、为什么、影响哪些地方，然后停下来等你点头。" },
      { type: "p", text: "你看完方案有三种动作：直接说「开干」、修改某一步（「第 3 步不要兼容层，直接切」）、或者拒绝整个方案让它重想。" },
      { type: "code", lang: "bash", text: "> /plan\n> 重写登录模块，用 JWT 替代 session\n\n· 读取 src/auth/session.ts\n· 读取 src/middleware/auth.ts\n· Grep \"req.session\" (47 matches in 12 files)\n· 读取 tests/auth.test.ts\n\n计划：\n1. 新增 src/auth/jwt.ts：封装 sign/verify\n2. 改 src/middleware/auth.ts：从 session 读改成从 header 读\n3. 改 src/routes/login.ts：登录成功后签发 JWT\n4. 兼容期：保留 session 逻辑 2 周\n5. 更新 12 个调用点\n6. 补 8 个新测试\n\n请确认，或告诉我哪里要调整。" },
      { type: "tip", text: "涉及多个文件、或你不确定影响范围的任务，一律先 /plan。代价是多花一分钟，收益是避免半小时的回滚。" }
    ]
  },
  "/goal": {
    tag: "任务",
    new: true,
    summary: "设定一个可验证的完成条件，让它自主做到为止。",
    body: [
      { type: "p", text: "2026-05-11（v2.1.139）新增。默认 Claude 每做一轮会停下来看你一眼，/goal 把这个循环改成「不停地做，直到目标达成」。" },
      { type: "p", text: "关键在「可验证」三个字：目标必须是 Claude 自己能判断对错的事情。npm test 全绿、tsc 零报错、端口 3000 能响应 200——这些它能跑命令自检。代码写得漂亮、性能更好——它没法验证，会一直改下去。" },
      { type: "code", lang: "bash", text: "> /goal 所有 tsc 报错清零，且 npm test 全绿\n\n目标设定 · 进度 0/2\n  [ ] tsc 报错清零（当前 47 个）\n  [ ] npm test 全绿（当前 3 failed）\n\n· 读取 tsconfig.json\n· 跑 npm test\n· 修 src/api/user.ts (Argument of type ...)\n· 跑 npm test\n· 修 src/lib/date.ts ...\n..." },
      { type: "p", text: "想提前停？按 Ctrl+C。想改目标？再打一次 /goal 覆盖。" },
      { type: "warn", text: "给 /goal 一个「可验证」的条件。让它「把代码写得漂亮」会变成无尽循环，耗光预算。如果目标比较抽象，拆成几个可验证的小目标串起来。" }
    ]
  },
  "/btw": {
    tag: "任务",
    new: true,
    summary: "不进主对话历史的旁白，适合临时闲聊。",
    body: [
      { type: "p", text: "想象你在指挥 Claude 做一件大事，中间突然想问一句「对了，这个项目用 pnpm 还是 npm？」。以前只能直接问，这句闲聊会进对话历史、之后每次 compact 都带着它。" },
      { type: "p", text: "/btw 的消息存在「旁路」里，不进主任务的上下文。长会话里能省出可观 token。" },
      { type: "code", lang: "bash", text: "> /btw 这个项目用 pnpm 还是 npm？\nClaude: 看 lockfile 是 pnpm-lock.yaml，所以 pnpm。\n\n> （继续主任务，刚才的问答不占主上下文）" }
    ]
  },
  "/rename": {
    tag: "任务",
    new: true,
    summary: "给当前会话起个人话名字。",
    body: [
      { type: "p", text: "默认每个会话用一串随机 ID 命名。同时开三四个会话（一个前端、一个后端、一个调研），回头 /resume 的时候根本分不清谁是谁。" },
      { type: "p", text: "/rename 给当前会话贴标签，之后在 /tasks、/resume、agent 视图里都以这个名字出现。" },
      { type: "code", lang: "bash", text: "> /rename 重构登录模块\n  会话已命名" }
    ]
  },
  "/loop": {
    tag: "任务",
    summary: "按间隔或自调节节奏反复执行一个提示。",
    body: [
      { type: "p", text: "给一个命令/提示加上循环。两种用法：" },
      { type: "ul", items: [
        "固定间隔：/loop 5m /review — 每 5 分钟审一次分支。",
        "自调节：/loop /babysit-prs — 不给间隔，Claude 自己决定多久查一次（它会看上次状态变化的速度）。"
      ]},
      { type: "p", text: "适合轮询型任务：等 CI、盯 PR 评论、监控某个状态直到满足条件。按 Esc 取消剩下的计划。" }
    ]
  },
  "/agents": {
    tag: "团队",
    summary: "创建和管理子代理（subagent）。",
    body: [
      { type: "p", text: "面板形式，列出当前环境下所有可用的子代理：Anthropic 内置的（Explore / Plan / general-purpose），以及你自己在 .claude/agents/ 下定义的自定义代理。" },
      { type: "p", text: "你也可以在这里启动、查看运行中的子代理。运行中的 agent 会显示实时进度，完成后汇报结果回主会话。" }
    ]
  },
  "/skills": {
    tag: "团队",
    summary: "管理可重用的技能。",
    body: [
      { type: "p", text: "Skill 是「按需召唤」的指令包。/skills 打开管理面板，列出项目、用户、插件提供的所有 skill，支持 type-to-filter 搜索（2.1.121）、按 token 占用排序（2.1.111，按 t 键）。" },
      { type: "p", text: "你也能在这里编辑、禁用、或查看某个 skill 的 SKILL.md 内容。" }
    ]
  },
  "/hooks": {
    tag: "团队",
    summary: "查看和配置生命周期钩子。",
    body: [
      { type: "p", text: "Hook 是事件监听器：PreToolUse / PostToolUse / Stop / UserPromptSubmit 等事件发生时自动跑你指定的脚本。用来做「写完文件自动格式化」「禁止改 .env」这类硬性规则。" },
      { type: "p", text: "/hooks 打开一个可视化面板查看当前挂了哪些钩子、触发了多少次、最近一次执行结果。出问题时比直接读 settings.json 直观。" }
    ]
  },
  "/mcp": {
    tag: "团队",
    summary: "接入第三方工具（GitHub、Slack、数据库等）。",
    body: [
      { type: "p", text: "Model Context Protocol 是给 Claude 加「外挂工具集」的标准。/mcp 查看当前连了哪些 MCP 服务器、每个暴露多少工具、OAuth 授权状态、最近失败原因。" },
      { type: "p", text: "连一个新服务器通常通过 .mcp.json 或 claude mcp add 命令完成，而不是在 /mcp 里——/mcp 更多是「看和管」用的。" }
    ]
  },
  "/review": {
    tag: "审查",
    summary: "对当前分支或指定 PR 做代码审查。",
    body: [
      { type: "p", text: "把 Claude 当一个「严厉但耐心」的 reviewer。/review 默认审当前分支相对 main 的所有 diff；/review 42 审 GitHub PR #42；/review --base develop 改比较基准。" },
      { type: "p", text: "它会按几类给反馈：正确性 bug、可读性问题、测试缺口、边界情况、性能陷阱。不会替你打分，会标清楚每条的严重程度。" }
    ]
  },
  "/security-review": {
    tag: "审查",
    summary: "对待提交的改动做专项安全审查。",
    body: [
      { type: "p", text: "比 /review 更聚焦：只看安全问题。注入（SQL / command / XSS）、鉴权漏洞、敏感信息泄露、反序列化、路径遍历、SSRF——按 OWASP Top 10 为主线过一遍。" },
      { type: "p", text: "适合在合并 PR 前跑一次。不能替代真正的安全审计，但能把 80% 的低垂果实抓掉。" }
    ]
  },
  "/simplify": {
    tag: "审查",
    summary: "审查改过的代码有没有可以简化的地方。",
    body: [
      { type: "p", text: "v2.1.111 里升级成三个 agent 并行的流水线：一个看重复代码、一个看可以抽出来的函数、一个看可以删除的防御性代码。" },
      { type: "p", text: "它给的建议不会自动应用——列出来让你决定。比 /review 更聚焦「少写点代码」这一个维度。" }
    ]
  },
  "/ultrareview": {
    tag: "审查",
    new: true,
    summary: "云端并行的全面代码审查。",
    body: [
      { type: "p", text: "v2.1.111 新增。把审查工作拆给多个远程 agent 并行跑，本地拿到一份聚合报告。比本地 /review 慢一点但深得多——适合重要 PR。" },
      { type: "code", lang: "bash", text: "$ claude ultrareview          # 当前改动\n$ claude ultrareview 42       # PR #42" },
      { type: "p", text: "可以在非交互命令行下调用，结果走 diffstat + 结构化输出，方便接 CI。" }
    ]
  },
  "/buddy": {
    tag: "彩蛋",
    new: true,
    summary: "Claude Code 里的 Tamagotchi：你的终端宠物。",
    body: [
      { type: "p", text: "2026 年 4 月 1 日上线的愚人节彩蛋，约一周后在 v2.1.97 中被移除。基于你账号 ID + 盐值 friend-2026-401 通过 FNV-1a hash + Mulberry32 PRNG 确定性生成——同一个账号永远得到同一只宠物。存活期间要求 Pro 订阅和 v2.1.89+。社区强烈要求恢复，但截至目前官方未重新上线。" },
      { type: "h", text: "生成机制" },
      { type: "ul", items: [
        "18 个物种，稀有度 Common 60% / Uncommon 25% / Rare 10% / Epic 4% / Legendary 1%。",
        "独立的 1% 闪光（Shiny）判定，闪光版自带彩虹渐变。",
        "5 维属性 0–100：DEBUGGING / PATIENCE / CHAOS / WISDOM / SNARK。",
        "首次 /buddy 时 Claude 自己给它起名字、编人设，之后存进 ~/.claude.json。不喜欢就得手动改 JSON。"
      ] },
      { type: "h", text: "子命令" },
      { type: "table", head: ["命令", "作用"], rows: [
        ["/buddy", "首次孵化 / 后续显示面板"],
        ["/buddy card", "显示完整属性卡片"],
        ["/buddy pet", "摸它，触发 2.5 秒爱心动画"],
        ["/buddy mute", "关掉台词气泡"],
        ["/buddy unmute", "重新打开台词"],
        ["/buddy off", "彻底隐藏宠物"]
      ]},
      { type: "tip", text: "存活期间，直接喊它的名字可以跟它对话。本质上是一个带角色设定的子会话。" },
      { type: "warn", text: "这个功能已在 v2.1.97 中被移除。以上信息记录的是它存活期间的行为，供了解历史。社区有第三方工具（如 Buddi）尝试复活它。" }
    ]
  },
  "/tui": {
    tag: "会话保养",
    new: true,
    summary: "切到无闪烁的全屏渲染模式。",
    body: [
      { type: "p", text: "v2.1.110 新增。在有的终端（旧版 iTerm2 + tmux、某些 Windows Terminal 配置）下，Claude Code 的富文本渲染会轻微抖动。/tui 切一种更稳的全屏模式，代价是失去一些外观细节。" },
      { type: "p", text: "/tui fullscreen 则是另一种超全屏，把整个窗口接管过来，适合纯 CLI 工作流。" }
    ]
  },
  "/rc": {
    tag: "团队",
    summary: "把当前会话切到 Remote Control 模式。",
    body: [
      { type: "p", text: "Remote Control 是 Claude Code 的「手机遥控」——把当前桌面会话接到 claude.ai 的手机 / 网页端，让你在离开电脑时继续审查、打断、确认。" },
      { type: "p", text: "配合 /schedule 和 push notification，可以做到「让 Claude 自己跑，跑到需要你决策的时候推一条通知过来」。" }
    ]
  },
  "/teleport": {
    tag: "团队",
    summary: "把 web/iOS 上的会话拉回终端。",
    body: [
      { type: "p", text: "Remote Control 的反向：你在手机上开始一个会话，想回到电脑继续，/teleport 把上下文、模型状态、正在跑的任务全部迁过来。" }
    ]
  },
  "/tasks": {
    tag: "任务",
    summary: "看当前会话的后台任务列表。",
    body: [
      { type: "p", text: "Claude Code 支持把任务丢到后台继续跑——长时间 build、CI 等待、跑满测试套件。/tasks 列出所有后台任务的状态：运行中 / 完成 / 失败 / 被取消。" },
      { type: "p", text: "和 /schedule 的区别：/tasks 是「当前会话里 spawn 出去的活」，/schedule 是「按 cron 定时跑的活」。" }
    ]
  },
  "/schedule": {
    tag: "任务",
    summary: "创建、更新、列出定时远程任务。",
    body: [
      { type: "p", text: "基于 cron 的定时器。典型场景：每天早上 9 点跑一次 /review；每 30 分钟查一次 CI 状态；每周一自动生成上周代码统计。" },
      { type: "p", text: "任务在 Anthropic 的远端 agent 上跑，结果可以推到 Slack、邮箱、或 Remote Control 通知里。设了 ANTHROPIC_API_KEY 会自动禁用（避免计费混乱）。" }
    ]
  },
  "/background": {
    tag: "任务",
    summary: "把整个会话丢到后台继续跑。",
    body: [
      { type: "p", text: "比 /schedule 轻量——不建定时器，只是把当前会话脱离你的终端。你可以关掉窗口，Claude 还在跑；过一会儿用 claude -c 或 /resume 接回来看结果。" }
    ]
  },
  "/doctor": {
    tag: "会话保养",
    summary: "诊断安装、设置、认证、MCP 问题。",
    body: [
      { type: "p", text: "出问题时第一步敲它。会检查：Claude Code 版本 / Node 版本 / 认证状态 / settings.json 语法 / hook 脚本是否可执行 / MCP 服务器是否健康 / 关键目录权限。" },
      { type: "p", text: "每一项给出状态和修复建议。发 bug report 之前最好先跑一次。" }
    ]
  },
  "/debug": {
    tag: "会话保养",
    summary: "显示当前会话的排障信息。",
    body: [
      { type: "p", text: "比 /doctor 更原始——倒出当前会话的全量调试日志：API 请求、工具调用耗时、hook 执行记录、MCP 通信。" },
      { type: "p", text: "开发自定义 skill / hook / MCP 服务器时常用。平时不用看。" }
    ]
  },
  "/usage": {
    tag: "账号",
    summary: "看当前计划的额度用到哪了。",
    body: [
      { type: "p", text: "v2.1.118 把旧的 /cost 和 /stats 合到一起。显示：本会话花费、今天花费、本周用量 vs 计划额度、5 小时刷新剩余、扩展额度（/extra-usage）情况。" }
    ]
  },
  "/insights": {
    tag: "账号",
    summary: "生成一份会话分析报告。",
    body: [
      { type: "p", text: "把你最近 N 天的使用模式做成 HTML 报告：哪类任务用得最多、哪些 skill 效率最高、哪些时段你最活跃、哪些命令你从来没用过。" },
      { type: "p", text: "偏数据向的视角，帮你自省自己和 Claude 的协作方式。" }
    ]
  },
  "/less-permission-prompts": {
    tag: "记忆",
    new: true,
    summary: "扫历史记录，自动生成只读命令白名单。",
    body: [
      { type: "p", text: "v2.1.111 新增的 skill。它读你过去会话里通过的所有权限请求，找出反复出现的只读命令（git status / ls / cat package.json / npm ls 之类），按使用频率排序，生成一份建议的 allow 列表，写进项目 .claude/settings.json。" },
      { type: "p", text: "装完明显少一半权限弹窗。没有副作用的命令就该免问。" }
    ]
  },
  "/vim": {
    tag: "编辑",
    summary: "切换 vim 模式输入。",
    body: [
      { type: "p", text: "对熟 vim 的人是救命稻草。切开后输入框进入 normal/insert 分模式，支持 h/j/k/l 移动、w/b 跳词、d/c/y 操作。" },
      { type: "p", text: "v2.1.118 起支持 v 和 V 的可视模式、可视行模式。" }
    ]
  },
  "/theme": {
    tag: "外观",
    summary: "改主题，支持创建自定义主题。",
    body: [
      { type: "p", text: "内置若干主题，包括 v2.1.111 新增的「Auto (match terminal)」——跟随你终端本身的配色。" },
      { type: "p", text: "v2.1.118 起支持写自定义主题到 ~/.claude/themes/，插件也可以通过 themes/ 目录分发。" }
    ]
  },
  "/fork": {
    tag: "会话保养",
    summary: "把当前会话分叉成新会话。",
    body: [
      { type: "p", text: "复制一份当前上下文到新的 session ID，两边可以各走各的。典型用例：走到一半的长任务，你想试两个不同方向——fork 一下，两个会话互不干扰地走。" }
    ]
  },
  "/resume": {
    tag: "会话保养",
    summary: "挑一个历史会话继续。",
    body: [
      { type: "p", text: "列出所有过往会话（用 /rename 命名过的会排在前面），选一个回到当时的上下文。对应 CLI 的 claude -c（最近一个）和 claude -r \"name\"（按名字）。" },
      { type: "p", text: "v2.1.117 起，对陈旧的大会话会提议先 summarize 再恢复，省内存。" }
    ]
  },
  "/exit": {
    tag: "会话保养",
    summary: "退出 Claude Code。Ctrl+D 或连按两次 Ctrl+C 等价。",
    body: [
      { type: "p", text: "关掉当前会话，回到你的 shell。就这么多。" },
      { type: "p", text: "你还想要什么？它叫 exit，它就是 exit。" },
      { type: "h", text: "等价操作" },
      { type: "ul", items: [
        "Ctrl+D — 发送 EOF，效果一样。",
        "Ctrl+C 连按两次 — 第一次中断当前输出，第二次退出。",
        "直接关终端窗口 — 粗暴但有效，会话状态仍会保存。"
      ]},
      { type: "tip", text: "退出前不用手动保存什么。会话历史自动持久化，下次 claude -c 就能接回来。" }
    ]
  },
  "subagent-explore": {
    tag: "Subagent",
    summary: "只读探索型子代理。用 Haiku 跑，便宜又快。",
    body: [
      { type: "p", text: "Explore 是一个只读的子代理——它只能看文件、搜索、Grep，不能写文件也不能跑有副作用的命令。它的存在意义是：让主 Claude 把「找东西」这种脏活外包出去，自己继续想大事。" },
      { type: "h", text: "什么时候会自动触发" },
      { type: "ul", items: [
        "你问了一个需要大范围搜索的问题（「这个函数在哪里被调用了」「项目里有没有用到 Redis」）。",
        "主 Claude 判断需要先摸清项目结构再动手，会自动 spawn 一个 Explore 去扫。",
        "你不需要手动触发——Claude 自己决定什么时候派它出去。"
      ]},
      { type: "h", text: "能不能主动用" },
      { type: "p", text: "可以。在 /agents 面板里选 Explore 启动，或者在对话里说「用 Explore agent 帮我找一下所有用到 dayjs 的地方」。" },
      { type: "h", text: "为什么用 Haiku" },
      { type: "p", text: "Explore 的任务是「读 + 搜」，不需要深度推理。Haiku 快且便宜，跑一次 Explore 的成本大约是 Opus 的 1/10。主 Claude 用 Opus 想方案，Explore 用 Haiku 跑腿——分工明确。" },
      { type: "h", text: "它能做什么" },
      { type: "ul", items: [
        "Read — 读文件内容",
        "Glob — 按模式列出文件",
        "Grep — 全文搜索",
        "Bash（只读命令）— git log、ls、cat 等"
      ]},
      { type: "h", text: "它不能做什么" },
      { type: "ul", items: [
        "写文件",
        "跑 npm install / git commit 等有副作用的命令",
        "调用 MCP 工具",
        "和你对话（它只向主 Claude 汇报结果）"
      ]}
    ]
  },
  "subagent-plan": {
    tag: "Subagent",
    summary: "设计方案型子代理。和 /plan 命令是一对。",
    body: [
      { type: "p", text: "Plan subagent 是 /plan 命令的底层实现。当你打 /plan 时，主 Claude 实际上 spawn 了一个 Plan 子代理，让它在只读模式下分析项目、产出方案，然后把方案交回给你审批。" },
      { type: "h", text: "什么时候会自动触发" },
      { type: "ul", items: [
        "你显式打了 /plan。",
        "主 Claude 判断任务复杂度高（涉及多文件、架构变更），会自动先走一遍 Plan 再动手。",
        "你在 CLAUDE.md 里写了「大改动必须先 plan」之类的规则时，它会更倾向于自动触发。"
      ]},
      { type: "h", text: "能不能主动用" },
      { type: "p", text: "可以。直接打 /plan 就是在用它。也可以在对话里说「先出个方案别动手」，效果一样。" },
      { type: "h", text: "和 Explore 的区别" },
      { type: "p", text: "Explore 只是「找东西」，Plan 是「找完之后还要想方案」。Plan 会产出一份结构化的计划文档（存到 .claude/plans/），列出步骤、影响范围、风险点。Explore 只返回搜索结果。" },
      { type: "h", text: "它的权限" },
      { type: "ul", items: [
        "可以读文件、搜索、Grep",
        "可以跑只读命令（git log、npm ls）",
        "不能写文件、不能跑有副作用的命令",
        "产出的方案需要你确认后，主 Claude 才会执行"
      ]}
    ]
  },
  "subagent-general": {
    tag: "Subagent",
    summary: "通用型子代理。什么都能干，是主 Claude 的完整分身。",
    body: [
      { type: "p", text: "general-purpose 是一个全能子代理——它拥有和主 Claude 几乎一样的权限（读、写、跑命令、调 MCP）。主 Claude 会在需要并行处理多件事时派它出去。" },
      { type: "h", text: "什么时候会自动触发" },
      { type: "ul", items: [
        "你给了一个大任务，主 Claude 决定拆成几个子任务并行跑。比如「重构这三个模块」，它可能 spawn 三个 general-purpose 各改一个。",
        "你用 /goal 设了一个复杂目标，主 Claude 可能派 general-purpose 去处理独立的子目标。",
        "你在 .claude/agents/ 下没有定义专用 agent 时，它是默认的「万能工人」。"
      ]},
      { type: "h", text: "能不能主动用" },
      { type: "p", text: "可以。在对话里说「spawn 一个子代理去跑测试，我继续改代码」，或者在 /agents 面板里手动启动。" },
      { type: "h", text: "和主 Claude 的区别" },
      { type: "ul", items: [
        "它不能直接和你对话——只向主 Claude 汇报结果。",
        "它有独立的上下文窗口，不会占用主会话的 token。",
        "它的权限继承主会话的 settings.json 配置（allow/deny 规则一样）。",
        "它跑完后，主 Claude 会把结果摘要告诉你。"
      ]},
      { type: "h", text: "典型场景" },
      { type: "ul", items: [
        "并行改多个独立模块",
        "一边跑长时间测试，一边继续写代码",
        "让它去做一个耗时但不需要你盯着的任务（生成文档、批量重命名）"
      ]}
    ]
  },
  "subagent-guide": {
    tag: "Subagent",
    summary: "Claude Code 专家。专门回答关于 Claude Code 自身的问题。",
    body: [
      { type: "p", text: "claude-code-guide 是一个知识型子代理——它对 Claude Code 的文档、SDK、API、配置项了如指掌。当你问的问题是关于 Claude Code 本身（而不是你的项目代码）时，主 Claude 可能会派它来回答。" },
      { type: "h", text: "什么时候会自动触发" },
      { type: "ul", items: [
        "你问了「/goal 怎么用」「hook 怎么配」「MCP 怎么连」这类关于 Claude Code 自身的问题。",
        "主 Claude 不确定某个 Claude Code 功能的细节时，会内部查询这个 agent。",
        "不是每次都触发——简单问题主 Claude 自己就能答。"
      ]},
      { type: "h", text: "能不能主动用" },
      { type: "p", text: "可以。说「用 claude-code-guide 帮我查一下 Agent SDK 的 max_turns 参数」，或者在 /agents 面板里选它。" },
      { type: "h", text: "它知道什么" },
      { type: "ul", items: [
        "所有斜杠命令的用法和参数",
        "settings.json 的所有配置键",
        "Hook / Skill / Agent 的写法",
        "MCP 协议和配置",
        "Agent SDK（Python / TypeScript）的 API",
        "CLI flag 和环境变量",
        "已知 bug 和 workaround"
      ]},
      { type: "tip", text: "它本质上是一个带了完整 Claude Code 文档的 RAG agent。你问它比去翻官网快。" }
    ]
  },
  "mcp-github": {
    tag: "MCP 服务器",
    summary: "让 Claude 直接操作 GitHub：Issues、PR、Actions、代码搜索。",
    body: [
      { type: "h", text: "提供的工具" },
      { type: "ul", items: [
        "create_issue / list_issues / search_issues — 创建、列出、搜索 Issue",
        "create_pull_request / merge_pull_request — 创建和合并 PR",
        "get_pull_request_diff — 拿 PR 的 diff（配合 /review 用）",
        "search_code — 在 GitHub 上搜代码（跨仓库）",
        "list_commits / get_commit — 查提交历史",
        "create_branch / push_files — 创建分支、推文件"
      ]},
      { type: "h", text: "实际场景" },
      { type: "p", text: "你说「帮我看看 #42 这个 PR 改了什么，给个 review」，Claude 直接调 get_pull_request_diff 拿到 diff，然后给你审查意见。不用你切到浏览器。" },
      { type: "h", text: "安装" },
      { type: "code", lang: "bash", text: "claude mcp add github -- npx -y @modelcontextprotocol/server-github" },
      { type: "p", text: "需要设置 GITHUB_TOKEN 环境变量（Personal Access Token）。" }
    ]
  },
  "mcp-slack": {
    tag: "MCP 服务器",
    summary: "让 Claude 读写 Slack：频道消息、搜索历史、发通知。",
    body: [
      { type: "h", text: "提供的工具" },
      { type: "ul", items: [
        "list_channels — 列出所有频道",
        "read_channel — 读某个频道的最近消息",
        "send_message — 发消息到频道或 DM",
        "search_messages — 全文搜索历史消息",
        "get_thread — 读某条消息的回复线程"
      ]},
      { type: "h", text: "实际场景" },
      { type: "p", text: "你说「看看 #backend 频道今天有没有人提到数据库迁移」，Claude 直接搜 Slack 历史，把相关消息摘要给你。或者任务完成后自动发一条通知到频道。" },
      { type: "h", text: "安装" },
      { type: "code", lang: "bash", text: "claude mcp add slack -- npx -y @modelcontextprotocol/server-slack" },
      { type: "p", text: "需要 Slack Bot Token（xoxb-...），在 Slack App 管理页面创建。" },
      { type: "warn", text: "建议在 permissions.deny 里加上 mcp__slack__send_message，防止 Claude 未经你确认就发消息。" }
    ]
  },
  "mcp-database": {
    tag: "MCP 服务器",
    summary: "让 Claude 直接连数据库：跑 SQL、看表结构、生成迁移。",
    body: [
      { type: "h", text: "提供的工具" },
      { type: "ul", items: [
        "query — 执行 SELECT 查询",
        "execute — 执行 INSERT/UPDATE/DELETE（需要额外权限）",
        "list_tables — 列出所有表",
        "describe_table — 查看表结构（字段、类型、索引）",
        "get_schema — 导出完整 schema"
      ]},
      { type: "h", text: "实际场景" },
      { type: "p", text: "你说「帮我看看 users 表的结构，然后写一个迁移脚本加一个 avatar_url 字段」。Claude 先 describe_table 看现有结构，再生成精确的 ALTER TABLE 语句。" },
      { type: "h", text: "安装（以 PostgreSQL 为例）" },
      { type: "code", lang: "bash", text: "claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres postgresql://user:pass@localhost:5432/mydb" },
      { type: "warn", text: "强烈建议用只读账号连接。如果需要写操作，在 permissions 里逐条放行，不要给 execute 全局 allow。" }
    ]
  },
  "mcp-puppeteer": {
    tag: "MCP 服务器",
    summary: "让 Claude 操控浏览器：点击、截图、自动化 E2E 测试。",
    body: [
      { type: "h", text: "提供的工具" },
      { type: "ul", items: [
        "navigate — 打开一个 URL",
        "screenshot — 截图当前页面",
        "click — 点击某个元素",
        "fill — 填写表单",
        "evaluate — 在页面里执行 JavaScript",
        "wait_for_selector — 等某个元素出现"
      ]},
      { type: "h", text: "实际场景" },
      { type: "p", text: "你说「打开 localhost:3000 的登录页，试试用 test@test.com 登录，截图给我看结果」。Claude 会启动无头浏览器，一步步操作，最后把截图贴回对话。" },
      { type: "h", text: "安装" },
      { type: "code", lang: "bash", text: "claude mcp add puppeteer -- npx -y @modelcontextprotocol/server-puppeteer" },
      { type: "p", text: "需要本地安装了 Chrome/Chromium。无头模式运行，不会弹窗。" },
      { type: "tip", text: "特别适合前端开发：改完样式让 Claude 截图对比，不用自己切浏览器刷新。" }
    ]
  },
  "mcp-pm": {
    tag: "MCP 服务器",
    summary: "接入项目管理工具：Linear、Notion、Jira。",
    body: [
      { type: "h", text: "能做什么" },
      { type: "ul", items: [
        "读取任务列表、看板状态",
        "创建新任务 / Issue",
        "更新任务状态（进行中 → 完成）",
        "搜索历史任务",
        "读取文档页面（Notion）"
      ]},
      { type: "h", text: "实际场景" },
      { type: "p", text: "你说「看看 Linear 里这个 sprint 还有哪些没做完的任务」，Claude 直接拉列表给你。或者做完一个功能后说「把 LIN-234 标记为完成」，它帮你更新状态。" },
      { type: "h", text: "安装（以 Linear 为例）" },
      { type: "code", lang: "bash", text: "claude mcp add linear -- npx -y @modelcontextprotocol/server-linear" },
      { type: "p", text: "每个工具需要各自的 API Token。Linear 在 Settings → API 里生成；Notion 需要创建 Integration；Jira 用 API Token + 邮箱。" },
      { type: "tip", text: "配合 /schedule 可以做到「每天早上 9 点自动拉今天的任务列表发到 Slack」。" }
    ]
  },
  "mcp-sentry": {
    tag: "MCP 服务器",
    summary: "让 Claude 读 Sentry：错误堆栈、事件频率、影响用户数。",
    body: [
      { type: "h", text: "提供的工具" },
      { type: "ul", items: [
        "list_issues — 列出最近的错误",
        "get_issue — 查看某个错误的详情（堆栈、影响范围）",
        "get_events — 查看某个错误的最近事件",
        "search_issues — 按关键词搜索错误"
      ]},
      { type: "h", text: "实际场景" },
      { type: "p", text: "你说「看看 Sentry 里最近 24 小时出现最多的错误是什么」，Claude 拉出来告诉你。然后你说「帮我修第一个」，它直接看堆栈、定位代码、给修复方案。从发现 bug 到修复一气呵成。" },
      { type: "h", text: "安装" },
      { type: "code", lang: "bash", text: "claude mcp add sentry -- npx -y @modelcontextprotocol/server-sentry" },
      { type: "p", text: "需要 Sentry Auth Token（在 Settings → Auth Tokens 里生成）和 Organization slug。" }
    ]
  }
};
