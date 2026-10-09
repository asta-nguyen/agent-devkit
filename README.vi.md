# agent-devkit

[English](README.md)

Bộ workflow spec-driven, evidence-first cho coding agent — có semantic code
retrieval, luồng context tiết kiệm token và các review gate rõ ràng.

Biến một yêu cầu mơ hồ thành thay đổi có thể trace:

![Năm bước từ truy hồi context đến verify](assets/readme-workflow-vi.png)

## Năng lực chính

| Năng lực | Agent nhận được gì |
|---|---|
| Semantic / RAG-style code retrieval | Semantic search, graph traversal và caller analysis qua OpenEZ tùy chọn; source trực tiếp vẫn là nguồn sự thật. |
| Delivery theo spec và plan | Design đã approve, plan mô tả behavior và test case có tên, impact map được lưu, edge-case coverage và gate implementation rõ ràng. |
| Quản lý context tiết kiệm token | Truy hồi source có trọng tâm, handoff ngắn gọn và evidence thay vì nạp cả repository vào context. |
| Verification dựa trên evidence | Test/check mới, finding chính xác `path:line` và gap `cannot verify` khi thiếu bằng chứng. |
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
skill có `name`, `description` và hướng dẫn từng bước. Không có script chạy
logic workflow; agent trực tiếp làm theo hướng dẫn.

## Sử dụng skills

Skills là các folder portable, không phải application dependency. Để dùng,
hãy làm cho folder `skills/<name>/` visible với skill loader của agent, sau đó
invoke skill theo tên hoặc yêu cầu task mà skill mô tả. `SKILL.md` là file bắt
buộc; `agents/openai.yaml` chỉ bổ sung metadata UI cho Codex/OpenAI.

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

```bash
codex plugin marketplace add asta-nguyen/agent-devkit --ref main
codex plugin add agent-devkit@agent-devkit
```

Sau khi push update, chạy `codex plugin marketplace upgrade agent-devkit`, rồi
mở một Codex thread mới để load version plugin mới.

### Cài Claude Code plugin

```bash
claude plugin marketplace add asta-nguyen/agent-devkit
claude plugin install agent-devkit@agent-devkit
```

Sau khi update, chạy `claude plugin marketplace update agent-devkit`, rồi
`/reload-plugins` trong Claude Code.

### Cài Cursor và Devin CLI

Cursor có thể import repository qua team marketplace, hoặc test local bằng cách
đặt repository tại `~/.cursor/plugins/local/agent-devkit` rồi reload Cursor.

Devin CLI:

```bash
devin plugins install asta-nguyen/agent-devkit
```

### Cài OpenCode

Trong `opencode.json` của project đích, thêm Git-backed plugin:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "agent-devkit@git+https://github.com/asta-nguyen/agent-devkit.git"
  ]
}
```

Restart OpenCode sau khi đổi config. Plugin đăng ký các skill đi kèm và inject
`using-devkit` vào user message đầu tiên. Adapter hiện nhắm tới OpenCode 1.x;
OpenCode V2 sẽ cần adapter plugin API riêng khi V2 trở thành release được hỗ
trợ.

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

### Cài bằng Agent Skills CLI

Repository này dùng layout Agent Skills mở: mỗi skill là
`skills/<name>/SKILL.md` với YAML frontmatter gồm `name` và `description`; không
cần `skill.json`.

```bash
npx skills add asta-nguyen/agent-devkit -a claude-code
```

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
brainstorm-feature → plan-feature      # công việc architectural: spec → plan
estimate-feature                       # estimate AI-assisted tùy chọn
implement-task → review-and-verify     # implement, review và verify
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
| `brainstorm-feature` | Phân loại scope, làm rõ và xin design approval; Spike đi tới điều tra, Bounded tới implement, Architectural qua plan. |
| `plan-feature` | Lưu execution plan đã được approve với task nhỏ và verify được. |
| `estimate-feature` | Estimate từng task khi PM/BA yêu cầu. |
| `implement-task` | Trace code, implement thay đổi nhỏ nhất và verify. |
| `systematic-debugging` | Tìm root cause, phân loại bug rồi fix hoặc hand off để design. |
| `review-and-verify` | Review diff, chạy check và không claim hoàn tất nếu thiếu evidence mới. |

### Audit

| Skill | Mục đích |
|---|---|
| `lean-audit` | Audit toàn repository về over-engineering/bloat; chỉ report cut có evidence, không tự apply fix. |

### Wiki lifecycle

| Skill | Mục đích |
|---|---|
| `document-wiki` | Xây domain baseline từ source, sau đó chọn feature chưa có trang hoặc có content gap đã xác minh. |

Deep pages chỉ dùng category có evidence: `architecture/` cho system structure,
`domains/` cho state và requirements, `workflows/` cho user/operator flow,
`integrations/` cho external system, `operations/` cho job/cron/deployment, và
`decisions/` cho decision có source. Repo nhỏ có thể chỉ cần `architecture/` và
`workflows/`; không tạo folder rỗng.

## Workflow tiêu chuẩn

### Feature mới

```text
brainstorm-feature → làm rõ scope, phân loại và xin design approval
  ├─ Spike          → điều tra và report
  ├─ Bounded        → implement-task → review-and-verify
  └─ Architectural  → spec → plan-feature → implement-task → review-and-verify
```

Sau mọi nhánh có implementation, dùng `document-wiki` nếu behavior thay đổi.
USER COMMITS sau khi review pass.

### Debug bug

```text
systematic-debugging          → điều tra và phân loại
  ├─ Diagnostic investigation → report evidence rồi dừng
  ├─ Architectural            → brainstorm-feature → plan-feature
  └─ Bounded                  → verify plan → regression check → fix
                              ↓
                              review-and-verify
```

### Document app hiện có

```text
setup-codebase → tạo wiki skeleton còn thiếu
        ↓
document-wiki  → tạo hoặc refresh domain baseline, rồi chọn docs cần bổ sung
```

## License

MIT — xem [LICENSE](LICENSE).
