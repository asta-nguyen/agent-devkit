# Agent DevKit — Kế hoạch Trial & Đánh giá

> Tài liệu hướng dẫn chạy pilot: thời gian, tiêu chí đánh giá, cách thu thập
> feedback, và quyết định go/no-go.

---

## Mục lục

1. [Thời gian trial](#1-thời-gian-trial)
2. [Chuẩn bị trước trial](#2-chuẩn-bị-trước-trial)
3. [Cách chạy trial](#3-cách-chạy-trial)
4. [Tiêu chí đánh giá](#4-tiêu-chí-đánh-giá)
5. [Form đánh giá](#5-form-đánh-giá)
6. [Quyết định sau trial](#6-quyết-định-sau-trial)

---

## 1. Thời gian trial

### **2 tuần (10 ngày làm việc)**

| Tuần | Mục tiêu |
|---|---|
| **Ngày 1** | Tech lead setup: cài skills + chạy `setup-codebase` + hướng dẫn team đọc `GUIDE.md` |
| **Tuần 1 (ngày 2-5)** | Team bắt đầu dùng — fix issues, thêm task nhỏ, quen workflow |
| **Tuần 2 (ngày 6-10)** | Team tiếp tục thực chiến + điền form đánh giá + retro cuối trial |

2 tuần đủ để team gập nhiều loại task (bug fix, feature nhỏ, doc) mà không kéo
dài momentum. Tech lead lo phần setup, team tập trung dùng.

---

## 2. Chuẩn bị trước trial

### Checklist trước ngày 1

- [ ] **Chọn 1-3 pilot users** — người dùng coding agent hàng ngày.
- [ ] **Chọn 1 repo target** — repo thật team đang work.
- [ ] **Mỗi pilot user ghi lại baseline** trước khi bắt đầu:
      - Thời gian trung bình hoàn thành 1 task
      - Số bug do agent sửa không đọc callers
      - Số lần agent báo "xong" nhưng chưa verify
      - Mức độ hài lòng với agent output (1-5)
- [ ] **Tạo shared channel/note** để team chia sẻ trải nghiệm realtime.

### Ghi chú cho pilot users

```text
Bạn sẽ dùng agent-devkit trong 2 tuần. Mọi task nên đi qua workflow:

  brainstorm-feature → (plan-feature) → implement-task → review-and-verify

Không cần nhớ tên skill — chỉ cần mô tả task, agent sẽ tự route.

Ghi lại sau mỗi task:
  - Task là gì? (feature / bug / doc)
  - Mất bao lâu?
  - Agent có tuân thủ workflow không? (approval gate, verify trước khi báo xong)
  - Có issue gì không?
  - So với trước đây (không devkit): tốt hơn / tệ hơn / ngang?
```

---

## 3. Cách chạy trial

### Ngày 1 — Tech lead setup

Tech lead làm 1 lần cho cả team:

```bash
# Cài skills cho tất cả pilot users
npx skills add asta-nguyen/agent-devkit -a claude-code

# Trên repo target, chạy setup-codebase để tạo context files
# (AGENTS.md, CLAUDE.md, docs/llm/ skeleton)
```

- Optional: `setup-openez` nếu repo lớn (>10k dòng).
- Hướng dẫn team đọc `GUIDE.md`.
- Restart agent session để skill list reload.

### Tuần 1 (Ngày 2-5) — Bắt đầu dùng

Team dùng devkit cho task thật: fix issues, thêm task nhỏ, feature nhỏ.

| Hoạt động | Số lượng đề xuất |
|---|---|
| Bug fix (qua `systematic-debugging`) | 1-2 bug |
| Feature nhỏ (bounded change) | 1-2 task |
| `document-wiki` | 1 lần (nếu có feature mới) |

**Không thay đổi cách làm việc bình thường** — chỉ thêm devkit workflow vào.

**Cuối tuần 1:** Quick check-in 15 phút:
- Setup có vấn đề gì không?
- Workflow có khó theo không?
- Agent có tuân thủ approval gate không?

### Tuần 2 (Ngày 6-10) — Thực chiến + Đánh giá

Team tiếp tục dùng devkit cho task hàng ngày + điền form đánh giá.

| Hoạt động | Mục đích |
|---|---|
| Tiếp tục fix issues, thêm features | Thu thập thêm data |
| Mỗi pilot user điền form (Section 5) | Structured feedback |
| Retro cuối trial (45 phút) | Go/no-go decision |

**Retro cuối tuần 2:**
- Agent có hiệu quả hơn khi dùng devkit không?
- Workflow nào hữu ích nhất? Workflow nào thừa?
- Có moment nào muốn bỏ qua workflow không? Tại sao?

---

## 4. Tiêu chí đánh giá

### 4.1. Productivity

| Metric | Cách đo | So với baseline |
|---|---|---|
| Thời gian hoàn thành task | Từ lúc bắt đầu đến review pass | Nhanh hơn / ngang / chậm hơn |
| Số vòng review | Số lần reviewer yêu cầu sửa | Ít hơn / ngang / nhiều hơn |
| Bug lọt qua review | Bug phát hiện sau merge | Ít hơn / ngang / nhiều hơn |

### 4.2. Chất lượng agent output

Đánh giá sau mỗi task — đánh dấu **Có** hoặc **Không**:

- Agent đọc code liên quan trước khi sửa
- Agent chờ approval trước khi code
- Agent chạy verify trước khi báo "xong"
- Agent không thêm change ngoài scope

**Mục tiêu:** ≥ 4/4 câu trả lời "Có" cho đa số task.

### 4.3. Trải nghiệm developer

Thang 1-5 (1 = tệ, 5 = rất tốt):

- Agent dễ dùng hơn với devkit? `[1] [2] [3] [4] [5]`
- Workflow tự nhiên, không cồng kềnh? `[1] [2] [3] [4] [5]`
- Tin tưởng output hơn? `[1] [2] [3] [4] [5]`
- Muốn tiếp tục dùng sau trial? `[1] [2] [3] [4] [5]`

**Skill nào hữu ích nhất?** (chọn top 3)
**Skill nào thừa?** (chọn 1-2)

### 4.4. Vấn đề gặp phải

Ghi lại trong quá trình trial:

- Setup có fail gì không?
- Workflow nào conflict với thói quen team?
- Agent có bỏ qua skill instructions không?
- Có moment nào muốn bypass workflow? Tại sao?

---

## 5. Form đánh giá (template)

> Mỗi pilot user điền form này vào cuối tuần 2. Copy vào Notion/Google Form.

```markdown
# Agent DevKit Pilot — Đánh giá cá nhân

**Tên:** ____________________
**Vai trò:** ____________________
**Số task đã làm với devkit:** ______

---

## A. Productivity

1. Thời gian trung bình hoàn thành 1 task TRƯỚC devkit: ____ giờ
   Thời gian trung bình hoàn thành 1 task VỚI devkit: ____ giờ
   → Chênh lệch: ____ (nhanh hơn / chậm hơn / ngang)

2. Số vòng review trung bình TRƯỚC devkit: ____
   Số vòng review trung bình VỚI devkit: ____
   → Chênh lệch: ____

3. Số bug lọt qua review TRƯỚC devkit: ____
   Số bug lọt qua review VỚI devkit: ____

---

## B. Chất lượng agent output

4. Agent có đọc callers trước khi sửa không?
   [ ] Luôn  [ ] Thường xuyên  [ ] Thỉnh thoảng  [ ] Hiếm khi

5. Agent có chờ approval trước khi code không?
   [ ] Luôn  [ ] Thỉnh thoảng bỏ qua  [ ] Thường bỏ qua

6. Agent có verify trước khi báo "xong" không?
   [ ] Luôn  [ ] Thỉnh thoảng  [ ] Thường nói "should work"

7. Agent có scope creep không?
   [ ] Không  [ ] 1-2 lần  [ ] Thường xuyên

---

## C. Trải nghiệm (thang 1-5)

8. Agent dễ dùng hơn hay khó hơn với devkit?          [1] [2] [3] [4] [5]
9. Workflow tự nhiên hay cồng kềnh?                   [1] [2] [3] [4] [5]
10. Tin tưởng output của agent hơn hay ít hơn?        [1] [2] [3] [4] [5]
11. Muốn tiếp tục dùng devkit sau trial?              [1] [2] [3] [4] [5]

---

## D. Skill ranking

12. Skill hữu ích nhất (chọn top 3):
    [ ] setup-codebase     [ ] setup-openez       [ ] read-codebase-context
    [ ] brainstorm-feature [ ] plan-feature       [ ] estimate-feature
    [ ] implement-task     [ ] systematic-debugging
    [ ] review-and-verify  [ ] document-wiki

13. Skill ít hữu ích nhất (chọn 1-2):
    [ ] setup-codebase     [ ] setup-openez       [ ] read-codebase-context
    [ ] brainstorm-feature [ ] plan-feature       [ ] estimate-feature
    [ ] implement-task     [ ] systematic-debugging
    [ ] review-and-verify  [ ] document-wiki

---

## E. Vấn đề & góp ý

14. Khó khăn lớn nhất khi dùng devkit:
    _______________________________________________

15. Workflow nào cảm giác thừa / nên bỏ:
    _______________________________________________

16. Workflow nào thiếu / nên thêm:
    _______________________________________________

17. Góp ý khác:
    _______________________________________________
```

---

## 6. Quyết định sau trial

### Retro cuối trial (1 giờ)

**Thành phần:** Pilot users + decision maker (bạn).

**Agenda:**

1. (10') Mỗi pilot user tóm tắt trải nghiệm — 3 phút/người
2. (15') Review form đánh giá — gom patterns
3. (15') Thảo luận metric productivity — có improvement không?
4. (10') Thảo luận edge cases — có blocker không?
5. (10') Go/no-go decision

### Khung quyết định

| Kết quả | Điều kiện | Hành động |
|---|---|---|
| **GO — Roll out toàn team** | ≥ 3/5 trên trải nghiệm + productivity ngang hoặc tốt hơn + không có blocker | Mở rộng cho toàn team, tạo onboarding plan |
| **GO có điều kiện** | Trải nghiệm ≥ 3/5 nhưng có 1-2 issue cần sửa | Sửa issue, chạy trial ngắn 1 tuần nữa với nhóm mở rộng |
| **NO — Dừng** | Trải nghiệm < 3/5 hoặc productivity giảm đáng kể | Phân tích root cause, quyết định có iterate hay bỏ |

### Sau khi GO

- [ ] Tạo onboarding doc riêng cho team (dựa trên `GUIDE.md` + feedback pilot)
- [ ] Cài đặt skills cho toàn team
- [ ] Chạy `setup-codebase` trên các repo chính
- [ ] Assign 1 pilot user làm "champion" — hỗ trợ team mới
- [ ] Check-in sau 2 tuần rollout để bắt đầu vấn đề sớm

### Sau khi NO

- [ ] Ghi lại root cause (workflow quá cồng kềnh? Agent không tuân thủ?
      Team không thấy giá trị?)
- [ ] Quyết định: iterate (sửa skills/workflow) hay bỏ (devkit không fit)
- [ ] Nếu iterate: lên thay đổi, chạy trial lại với nhóm nhỏ

---

## Tóm tắt nhanh

```text
┌──────────────────────────────────────────────────────┐
│  TRIAL: 2 tuần, 1-3 người, 1 repo thật               │
│                                                      │
│  Ngày 1: Tech lead setup (skills + setup-codebase)   │
│  Tuần 1: Team dùng — fix issues, task nhỏ            │
│  Tuần 2: Team thực chiến + form + retro              │
│                                                      │
│  ĐO:                                                 │
│    • Thời gian task (so với baseline)                │
│    • Số vòng review (so với baseline)                │
│    • Agent tuân thủ workflow? (approval, verify)     │
│    • Trải nghiệm developer (1-5 scale)               │
│    • Skill ranking (hữu ích / thừa)                  │
│                                                      │
│  QUYẾT ĐỊNH:                                         │
│    GO / GO có điều kiện / NO                         │
│    Dựa trên: productivity + trải nghiệm + blockers   │
└──────────────────────────────────────────────────────┘
```
