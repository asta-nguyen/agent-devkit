# agent-devkit

[English](README.md)

Bộ workflow spec-driven, evidence-first cho coding agent — có semantic code
retrieval, luồng context tiết kiệm token và các review gate rõ ràng.

Biến một yêu cầu mơ hồ thành thay đổi có thể trace:

```text
truy hồi context → ghi quyết định → viết spec/plan → implement → verify
```

## Năng lực chính

| Năng lực | Agent nhận được gì |
|---|---|
| Semantic / RAG-style code retrieval | Semantic search, graph traversal và caller analysis qua OpenEZ tùy chọn; source trực tiếp vẫn là nguồn sự thật. |
| Delivery theo spec và plan | Design đã approve, `Global Constraints`, edge-case coverage và gate implementation rõ ràng. |
| Quản lý context tiết kiệm token | Truy hồi source có trọng tâm, handoff ngắn gọn và evidence thay vì nạp cả repository vào context. |
| Verification dựa trên evidence | Test/check mới, finding chính xác `path:line` và gap `cannot verify` khi thiếu bằng chứng. |
| Capture và enforce convention | Rule riêng của repository có provenance, approval, scoped precedence và review evidence. |
| Lean audit toàn repository | Finding report-only với `delete`, `stdlib`, `native`, `yagni`, `shrink`, không auto-fix. |

## agent-devkit làm gì?

Coding agent cần context chính xác và cập nhật để làm việc hiệu quả. Project
này cung cấp các skill Markdown portable để bootstrap context, truy hồi quan
hệ trong code, design và plan thay đổi, implement theo convention local, debug
root cause, verify evidence mới và duy trì wiki LLM bám vào source code thật.

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
- **Devin CLI:** `.devin-plugin/` đóng gói cùng `skills/` tree thành plugin.
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
setup-openez                           # semantic index cho repo non-trivial
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

Skills có thể ưu tiên OpenEZ khi có, nhưng luôn phải có fallback đọc source
trực tiếp. Plugin là tùy chọn; shared `SKILL.md` folder đã đủ cho workflow.

## Các skill

### Bootstrap và context

| Skill | Mục đích |
|---|---|
| `using-devkit` | Route task đến workflow devkit phù hợp trước khi edit. |
| `setup-codebase` | Tạo context file còn thiếu và capture convention của repository. |
| `setup-openez` | Cài, index và verify kết nối OpenEZ MCP. |
| `read-codebase-context` | Query OpenEZ và trace code path trước feature hoặc wiki work. |
| `context-handoff` | Lưu checkpoint ngắn gọn khi session cần pause. |

### Phát triển feature

| Skill | Mục đích |
|---|---|
| `brainstorm-feature` | Phân loại spike/bounded/architectural, làm rõ scope và xin approval. |
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
| `document-wiki` | Xây domain baseline từ source, sau đó chọn feature docs thiếu hoặc stale. |

Deep pages chỉ dùng category có evidence: `architecture/` cho system structure,
`domains/` cho state và business rules, `workflows/` cho user/operator flow,
`integrations/` cho external system, `operations/` cho job/cron/deployment, và
`decisions/` cho decision có source. Repo nhỏ có thể chỉ cần `architecture/` và
`workflows/`; không tạo folder rỗng.

## Workflow tiêu chuẩn

### Feature mới

```text
brainstorm-feature → làm rõ scope, phân loại và xin design approval
        ↓
plan-feature       → lưu plan đã approve
        ↓
implement-task     → code và verify
        ↓
review-and-verify  → review evidence mới
        ↓
document-wiki      → refresh docs nếu behavior thay đổi
        ↓
USER COMMITS
```

### Debug bug

```text
systematic-debugging → điều tra và phân loại
  ├─ Spike           → report evidence rồi dừng
  ├─ Architectural   → brainstorm-feature → plan-feature
  └─ Bounded         → verify plan → regression test → fix
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
