# agent-devkit

[English](README.md)

Bộ skill làm task cho coding agent: đọc repository, làm rõ quyết định cần
thiết, code, check, cập nhật tài liệu liên quan và review.

**Hiểu task → thực hiện → review và hoàn tất.**

Version 0.10.0 — xem [changelog](CHANGELOG.md) và [release notes](RELEASE_DESCRIPTION.md).

Không cần nhớ tên skill. Chỉ cần giao task:

```text
Làm task này từ đầu đến cuối. Làm rõ behavior và edge cases còn mở,
tóm tắt plan để duyệt, rồi code, verify, cập nhật tài liệu liên quan và review.
Hỏi khi cần quyết định material. Không commit.
```

Clear, small change chỉ bỏ qua approval khi request nêu đúng file hoặc symbol
và kết quả, impact check giữ mọi caller, test, config, wiki trong scope, không
đụng public API, schema, dependency, CI, security boundary hay rủi ro mất dữ
liệu, và không phải bug. Nếu thiếu điều kiện, dùng Bounded: đưa giải pháp ngắn
trong chat để duyệt. Architectural dùng design.md và tasks.md, duyệt chung một
lần. Agent tự gọi skill tiếp theo. Hướng dẫn chi tiết:
[Tiếng Việt](GUIDE.vi.md) · [English](GUIDE.md).

## Năng lực chính

| Năng lực | Agent nhận được gì |
|---|---|
| Semantic / RAG-style code retrieval | Semantic search, graph traversal và caller analysis qua OpenEZ tùy chọn; source trực tiếp vẫn là nguồn sự thật. |
| Delivery theo spec và plan | Design đã approve, plan mô tả behavior và test case có tên, impact map được lưu, edge-case coverage và gate implementation rõ ràng. |
| Quản lý context tiết kiệm token | Truy hồi source có trọng tâm, handoff ngắn gọn và evidence thay vì nạp cả repository vào context. |
| Verification dựa trên evidence | Baseline từ check đã có, finding chính xác `path:line` và gap `cannot verify` khi thiếu bằng chứng; không tự dựng test runner chỉ để có baseline. |
| Trace và review qua subagent | Brief yêu cầu host subagent không sửa file; parent tự verify evidence, còn quyền tool do host kiểm soát. |
| Capture và enforce convention | Rule riêng của repository có provenance, approval, scoped precedence và review evidence. |
| Lean audit toàn repository | Finding report-only với `delete`, `stdlib`, `native`, `yagni`, `shrink`, không auto-fix. |

## agent-devkit làm gì?

Coding agent cần context chính xác và cập nhật để làm việc hiệu quả. Project
này cung cấp các skill Markdown portable để bootstrap context, truy hồi quan
hệ trong code, design và plan thay đổi, implement theo convention local, debug
root cause, verify evidence mới và duy trì wiki LLM bám vào source code thật.

Plan mô tả behavior và cách kiểm tra; `implement-task` mới viết code. Một thay
đổi non-bug, ít rủi ro và có scope chính xác chỉ được làm ngay sau khi
`brainstorm-feature` kiểm tra impact map.

## Skills

Skills là các Markdown playbook điều khiển bằng prompt trong `skills/`. Mỗi
skill có `name`, `description` và hướng dẫn từng bước. `document-wiki` có thêm
validator không dependency để kiểm tra nội dung đã ghi trong `docs/llm/`.

## Sử dụng skills

Hướng dẫn đầy đủ theo quy trình làm việc: [GUIDE.vi.md](GUIDE.vi.md).

Skills là các folder portable, không phải application dependency. Để dùng,
hãy làm cho folder `skills/<name>/` visible với skill loader của agent, sau đó
invoke skill theo tên hoặc yêu cầu task mà skill mô tả. `SKILL.md` là file bắt
buộc.

### Đóng gói cho các harness

Đây là source tree dùng để phát triển skills. Giữ file canonical trong
`skills/`; không tạo installation mirror trong `.agents/skills/`.

- **Codex:** `.codex-plugin/` và `hooks/hooks.json` cung cấp plugin integration
  tùy chọn cùng SessionStart bootstrap.
- **Claude Code:** `.claude-plugin/` dùng `hooks/claude-codex-hooks.json` và
  cùng `skills/` tree.
- **Cursor:** `.cursor-plugin/` dùng `hooks/cursor-hooks.json` và cùng
  `skills/` tree.
- **Devin CLI:** `.devin-plugin/` đóng gói cùng `skills/` tree thành plugin;
  `hooks.json` ở root chạy bootstrap `SessionStart` dùng chung. Plugin hooks
  trên CLI/Desktop có thể fail-open; kiểm tra `AGENT-DEVKIT:ACTIVE` và gọi
  `using-devkit` thủ công nếu bootstrap không chạy. Devin cũng nạp root
  `AGENTS.md` của plugin; contract phát triển trong đó chỉ áp dụng khi sửa source
  agent-devkit, không áp quy tắc riêng của repo này lên project người dùng.
- **OpenCode:** `.opencode/plugins/agent-devkit.js` đăng ký `skills/` tree
  canonical và bootstrap `using-devkit` qua OpenCode plugin API.

Project đích, không phải repository này, sở hữu `AGENTS.md` và
`.agents/skills/` của nó.

### Cài Codex plugin

Repository này expose Codex plugin qua marketplace tại
`.agents/plugins/marketplace.json`:

Để cả team dùng cùng version, pin Codex, Claude Code và OpenCode vào cùng một
release tag. Ví dụ dưới đây dùng `v0.10.0`; khi nâng version, đổi cả ba ref
cùng lúc sang release có chứa thay đổi team cần dùng.

```bash
codex plugin marketplace add asta-nguyen/agent-devkit --ref v0.10.0
codex plugin add agent-devkit@agent-devkit
```

Nâng lên release mới: xem [Nâng cấp](#nâng-cấp).

### Cài Claude Code plugin

```bash
claude plugin marketplace add asta-nguyen/agent-devkit#v0.10.0
claude plugin install agent-devkit@agent-devkit --scope user
```

Nâng lên release mới: xem [Nâng cấp](#nâng-cấp).

### Cài Cursor và Devin CLI

Cursor có thể import repository qua team marketplace, hoặc test local bằng cách
đặt repository tại `~/.cursor/plugins/local/agent-devkit` rồi reload Cursor.

`devin plugins install` không có tùy chọn tag (`#` trong source là thư mục
con), nên cài trực tiếp luôn theo default branch. Manifest dependency của Devin
nhận `ref` hoặc `sha` ([tài liệu plugin Devin](https://docs.devin.ai/cli/extensibility/plugins/overview));
repository này chưa tài liệu hóa cách đó.

```bash
devin plugins install asta-nguyen/agent-devkit
```

### Cài OpenCode

Trong `opencode.json` của project đích, thêm Git-backed plugin:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "agent-devkit@git+https://github.com/asta-nguyen/agent-devkit.git#v0.10.0"
  ]
}
```

Restart OpenCode sau khi đổi config. Plugin đăng ký các skill đi kèm và inject
`using-devkit` vào user message đầu tiên. Adapter hiện nhắm tới OpenCode 1.x;
OpenCode V2 sẽ cần adapter plugin API riêng khi V2 trở thành release được hỗ
trợ. Nâng lên release mới: xem [Nâng cấp](#nâng-cấp).

### Cài skill trực tiếp vào project

Với project discover repository-local skills từ `.agents/skills`, chạy lệnh sau
ở project đích và thay source path bằng clone local của bạn:

```bash
mkdir -p .agents/skills
cp -R /path/to/agent-devkit/skills/. .agents/skills/
find .agents/skills -name SKILL.md -print
```

Copy nguyên folder của từng skill để các file hỗ trợ trong `references/` đi
cùng skill đó.

### Nâng cấp

Chọn release tag mới và chuyển mọi client đang pin sang tag đó cùng lúc. Thay
`vX.Y.Z` bằng tag đó.

| Client | Đang pin tag | Đang theo default branch |
|---|---|---|
| Codex | Sửa `ref = "vX.Y.Z"` trong `[marketplaces.agent-devkit]` của `~/.codex/config.toml`, rồi chạy `codex plugin marketplace upgrade agent-devkit` | `codex plugin marketplace upgrade agent-devkit` |
| Claude Code | `claude plugin marketplace remove agent-devkit`<br>`claude plugin marketplace add asta-nguyen/agent-devkit#vX.Y.Z`<br>`claude plugin install agent-devkit@agent-devkit --scope user` | `claude plugin marketplace update agent-devkit`<br>`claude plugin update agent-devkit@agent-devkit` |
| OpenCode | Đổi `#vX.Y.Z` trong plugin entry của `opencode.json` | Xóa folder của URL đó trong `~/.cache/opencode/packages/` |
| Devin CLI | `devin plugins install` không hỗ trợ | `devin plugins update agent-devkit` |
| Cursor | Checkout tag trong bản local, hoặc theo cách update của team marketplace | Pull bản local, hoặc Refresh team marketplace import từ GitHub (thủ công, hoặc Auto Refresh; xem [tài liệu plugin Cursor](https://cursor.com/docs/plugins)) |

Sau đó mở Codex thread mới, restart Claude Code (hoặc chạy `/reload-plugins`),
restart OpenCode, mở Devin session mới, hoặc reload cửa sổ Cursor. Kiểm tra
bằng `codex plugin list`, `claude plugin list`, hoặc `devin plugins list`, và
tìm dòng `AGENT-DEVKIT:ACTIVE` trong session mới.

- Codex và Claude Code từ chối add lại `agent-devkit` với ref khác khi nó vẫn
  đang được cấu hình. Lệnh upgrade/update chỉ refresh ref hiện tại, không đổi
  ref.
- Xóa Claude marketplace sẽ gỡ plugin của nó, nên cần cài lại ở cùng scope.
  Xem [hướng dẫn quản lý plugin của Claude Code](https://code.claude.com/docs/en/plugins/install).
- Đã kiểm với Codex CLI 0.163.0, Claude Code 2.1.301 và Devin CLI 3000.11.92
  (v0.8.0 → v0.9.0); bước cache OpenCode và Cursor chưa chạy lại.

### Cài bằng Agent Skills CLI

Repository này dùng layout Agent Skills mở: mỗi skill là
`skills/<name>/SKILL.md` với YAML frontmatter gồm `name` và `description`; không
cần `skill.json`.

```bash
npx skills add asta-nguyen/agent-devkit -a claude-code
```

Lệnh này theo default branch. Nếu team cần pin version, dùng hướng dẫn native
plugin phía trên.

Repository public hiện tại là `asta-nguyen/agent-devkit`; shorthand
`asta/agent-devkit` không phải GitHub path hiện tại.

Cài toàn bộ skill vì các workflow skill tham chiếu lẫn nhau. Hãy xem các bản
copy là managed files: không tùy biến chúng trong project đích. Update sẽ ghi
đè skill cùng tên; folder skill đã retired phải tự xóa. Sau khi copy, mở agent
session mới để skill list được reload.

## Routing nhanh

```text
using-devkit                          # chọn workflow skill phù hợp
setup-codebase                         # lần đầu vào repo thiếu context
setup-openez                           # setup/refresh tùy chọn khi cần và được duyệt
read-codebase-context                  # hiểu code trước khi thay đổi
context-handoff                        # checkpoint khi phải tạm dừng
document-wiki                          # document feature hiện có
lean-audit                             # audit simplicity toàn repo; chỉ report
brainstorm-feature → plan-feature      # design.md + tasks.md → duyệt chung một lần
estimate-feature                       # estimate AI-assisted tùy chọn
implement-task → review-and-verify     # code, check, tài liệu liên quan, final review
systematic-debugging                   # điều tra trước khi fix bug
```

## OpenEZ

OpenEZ là code-intelligence MCP service độc lập. Cài/index repository và setup
client bạn dùng, sau đó restart client để MCP tools được load:

```bash
openez init <repo-path>
openez index <repo-path>
openez setup codex                  # hoặc claude / opencode
```

Skills dùng thứ tự Locate → Expand → Confirm → Read:

| Bước | Nhu cầu | Công cụ |
|---|---|---|
| Locate | Khái niệm hoặc hành vi | OpenEZ `code_query` |
| Locate | Tên file gần đúng | FFF fuzzy file find |
| Locate | Identifier hoặc literal | FFF grep, fallback sang `rg` |
| Locate | Regex | `rg` |
| Expand | Caller và callee | OpenEZ `code_context` (1–2 hops) |
| Confirm | Tham chiếu động hoặc đăng ký | FFF multi-pattern grep, fallback sang `rg` |
| Read | Cấu trúc file lớn và evidence | OpenEZ `code_outline`, rồi đọc source hiện tại trực tiếp |

Kết quả search/index chỉ dùng để điều hướng, không phải evidence. Plugin là
tùy chọn; dùng plugin khi muốn phân phối skill, MCP server và UI cùng nhau.
Chỉ cần thư mục `SKILL.md` dùng chung cũng đủ cho workflow.

## Tùy chọn: tìm kiếm FFF

FFF bổ sung watcher nền cập nhật content index trong RAM khi phát hiện file
thay đổi, kể cả edit chưa commit. FFF còn có fuzzy file find xếp hạng theo
frecency, multi-pattern grep trong một lần gọi, và chú thích trạng thái Git
cho file modified, untracked, staged. Xem [FFF README chính thức, mục MCP
server](https://github.com/dmtrKovalenko/fff).

FFF hữu ích với repository lớn/monorepo có nhiều lượt search lặp lại, thường
xuyên tìm tên file gần đúng, quét caller/reference khi review hoặc lean-audit,
hoặc dùng cùng OpenEZ để cover file đổi sau lần index gần nhất. Chi phí gồm
RAM cho content index, watcher chạy nền, cấu hình MCP theo từng client và lần
kiểm tra update lúc khởi động. Với fff-mcp 0.11.0, `--no-update-check` được
ghi trong `fff-mcp --help`, không có trong README.

| Hệ điều hành | Cài đặt |
|---|---|
| macOS / Linux | <code>curl -L https://dmtrkovalenko.dev/install-fff-mcp.sh &#124; bash</code> |
| Windows (PowerShell) | <code>irm https://raw.githubusercontent.com/dmtrKovalenko/fff/main/install-mcp.ps1 &#124; iex</code> |
| macOS / Linux (Homebrew) | `brew install dmtrKovalenko/fff/fff-mcp`<br>`brew upgrade fff-mcp` để cập nhật sau này |

Hãy đọc install script trước khi pipe script vào shell. Khi đăng ký MCP, dùng
đường dẫn binary tuyệt đối vì desktop client có thể không nhận `PATH` từ shell:
installer một dòng mặc định ở `$HOME/.local/bin/fff-mcp`, Homebrew ở
`$(brew --prefix)/bin/fff-mcp`, Windows in đường dẫn sau khi cài.

Ví dụ Codex chính thức:

```sh
codex mcp add fff -- "$(brew --prefix)/bin/fff-mcp"
```

Lệnh tạo entry trong `~/.codex/config.toml` dạng:

```toml
[mcp_servers.fff]
command = "/absolute/path/to/fff-mcp"
```

Muốn bỏ lần kiểm tra update lúc khởi động thì thêm thủ công riêng; lệnh trên
không tạo dòng này:

```toml
args = ["--no-update-check"]
```

Với client khác, làm theo docs chính thức hoặc wiring instruction do installer
in ra; tài liệu này không tự đặt format: [Claude Code](https://code.claude.com/docs/en/mcp),
[Cursor](https://docs.cursor.com/context/model-context-protocol),
[OpenCode](https://opencode.ai/docs/en/mcp-servers/),
[Devin](https://docs.devin.ai/cli/extensibility/mcp/configuration). Sau đó
restart client.

Trong fff-mcp 0.11.0, tool có tên `find_files`, `grep`, `multi_grep`; FFF
README gọi chúng là `fffind`, `ffgrep`, `fff-multi-grep`. Đây là ví dụ theo
version; nếu tên khác, xem tool list của server đang kết nối. Luôn ghi “FFF
grep” cho capability này. FFF grep tìm identifier literal; regex dùng `rg`.
Không chép chỉ dẫn chung “dùng FFF cho mọi tìm kiếm” vào `CLAUDE.md` hoặc
`AGENTS.md`; routing của devkit vẫn có hiệu lực và FFF là tùy chọn.

FFF không bắt buộc. Không có FFF, các skill dùng `rg` và vẫn đạt cùng kết quả.

## Các skill

### Bootstrap và context

| Skill | Mục đích |
|---|---|
| `using-devkit` | Route task đến workflow devkit phù hợp trước khi edit. |
| `setup-codebase` | Tạo context file còn thiếu và capture convention của repository. |
| `setup-openez` | Hỏi trước khi cài CLI, thêm hướng dẫn vào `AGENTS.md` có sẵn hoặc wiring client; báo riêng trạng thái CLI index và MCP, ghi rõ MCP chưa xác minh nếu tools không load. |
| `read-codebase-context` | Chọn công cụ tìm phù hợp rồi trace code path trước feature hoặc wiki work. |
| `context-handoff` | Lưu checkpoint ngắn gọn khi session cần pause. |

### Phát triển feature

| Skill | Mục đích |
|---|---|
| `brainstorm-feature` | Phân loại scope, làm rõ và xin design approval; Spike đi tới điều tra, Bounded tới implement, Architectural qua change folder. |
| `plan-feature` | Viết `tasks.md` cạnh `design.md`, tóm tắt plan và xin duyệt chung một lần; plan legacy giữ vị trí/gate cũ. |
| `estimate-feature` | Estimate task trong change Architectural hoặc plan legacy khi được yêu cầu. |
| `implement-task` | Chạy check hiện có trước lần sửa source đầu tiên, thực thi task đã duyệt, ghi progress/result và cập nhật tài liệu trước final review. |
| `systematic-debugging` | Tìm root cause, phân loại bug rồi fix hoặc hand off để design. |
| `review-and-verify` | Review diff, chạy check và không claim hoàn tất nếu thiếu evidence mới. |

### Audit

| Skill | Mục đích |
|---|---|
| `lean-audit` | Audit toàn repository về over-engineering/bloat; chỉ report cut có evidence, không tự apply fix. |

### Wiki lifecycle

| Skill | Mục đích |
|---|---|
| `document-wiki` | Tự cập nhật behavior bị task ảnh hưởng trong wiki hiện có; yêu cầu wiki độc lập vẫn dùng baseline inventory và chọn feature. |

Deep pages chỉ dùng category có evidence: `architecture/` cho system structure,
`domains/` cho state và requirements, `workflows/` cho user/operator flow,
`integrations/` cho external system, `operations/` cho job/cron/deployment, và
`decisions/` cho decision có source. Repo nhỏ có thể chỉ cần `architecture/` và
`workflows/`; không tạo folder rỗng.

## Workflow tiêu chuẩn

### Feature mới

```text
Làm rõ behavior và edge cases liên quan từ source
  → Architectural: viết design.md + tasks.md (+ delta.md khi cần)
  → Tóm tắt mục tiêu, scope, tasks, verify, tài liệu và rủi ro
  → Duyệt chung một lần
  → Code từng task, check, ghi progress/result
  → Tự cập nhật tài liệu trong wiki hiện có; merge delta trước
  → Final review code và tài liệu
  → Review pass thì archive/sửa link và báo evidence
```

Agent tự xử lý các thao tác nội bộ. Người dùng trả lời quyết định material và
duyệt giải pháp khi cần. Agent sửa lỗi trong scope và chạy lại; dừng nếu cùng
blocker vẫn còn sau một lần sửa mà không có thông tin mới, sau ba lần sửa lỗi
không thành công cho một blocker (rồi quay lại `brainstorm-feature`), hoặc khi
cần mở rộng scope hay hỏi quyết định. Setup trong task code chỉ tạo context cần
thiết, không tự dựng wiki. Wiki setup là yêu cầu riêng; plan-only không tự bắt
đầu code. Người dùng review diff rồi commit.

### Debug bug

```text
systematic-debugging          → điều tra và phân loại
  ├─ Bug question             → report evidence rồi dừng
  ├─ Architectural            → brainstorm-feature → plan-feature
  └─ Bounded                  → verify plan → regression check → fix
                              ↓
                              review-and-verify
```

Khi implementation gọi debugging giữa task, debugging trả fix/check evidence
về task đó; implementation sở hữu final review và archive.

### Document app hiện có

```text
setup-codebase → tạo wiki skeleton còn thiếu
        ↓
document-wiki  → tạo hoặc refresh domain baseline, rồi chọn docs cần bổ sung
```

## License

MIT — xem [LICENSE](LICENSE).
