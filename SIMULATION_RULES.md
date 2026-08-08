# HƯỚNG DẪN & QUY TẮC THIẾT KẾ PHÒNG THÍ NGHIỆM ẢO / MÔ PHỎNG TƯƠNG TÁC (PHYSICS SIMULATION GUIDELINES)

Tài liệu này tổng hợp cấu trúc kiến trúc, quy tắc giao diện (UI/UX), các tiêu chuẩn toán-lý và nguyên tắc thiết kế layout thu gọn (Compact Mode) để áp dụng cho các trang mô phỏng tương tác vật lý/khoa học khác.

---

## 1. CẤU TRÚC KIẾN TRÚC TỔNG THỂ (APP ARCHITECTURE)

Một trang mô phỏng tương tác tiêu chuẩn được chia làm 5 tầng chính:

```
[ Top Header: Tiêu đề Bài học + Bộ lọc Chế độ + Công cụ Toàn cục ]
                       │
[ Tab Navigation: Chuyển đổi giữa các Bài thí nghiệm & Bảng số liệu ]
                       │
┌───────────────────────────────────────────────┐
│  CỘT TRÁI (7 COLS): KHÔNG GIAN MÔ PHỎNG       │  CỘT PHẢI (5 COLS): BỘ ĐIỀU KHIỂN & LÝ THUYẾT
│  1. Display Toggles (Tùy chọn hiển thị ĐẶT TRÊN)│  - Controls Card (Thanh trượt + Ô nhập số + Giá trị live)
│  2. VectorCanvas (Khung SVG / HTML5 Canvas)   │  - Motion Simulation (Khối lượng, Vận tốc, Gia tốc)
│                                               │  - Formula Box & Exploration Questions (Công thức + Hỏi đáp)
└───────────────────────────────────────────────┘
```

---

## 2. QUY TẮC BỐ CỤC & TỐI ƯU KHÔNG GIAN (RESPONSIVE & COMPACT MODE)

### A. Quy tắc Lưới & Vị trí Thành phần
* **Desktop (≥ 1024px):** Chia tỉ lệ `12 cột` (`lg:grid-cols-12`).
  * **Cột trái (Canvas & Tùy chọn):** Chiếm `7/12` cột.
    * **Khung Tùy chọn hiển thị (Display Options Toolbar):** **BẮT BUỘC ĐẶT Ở TRÊN (TRƯỚC)** khung mô phỏng Canvas.
    * **Khung Mô phỏng (VectorCanvas):** Đặt ngay dưới thanh Tùy chọn hiển thị.
  * **Cột phải (Điều khiển & Công thức):** Chiếm `5/12` cột.
* **Mobile & Tablet (< 1024px):** Tự động xếp chồng thành `1 cột` (`grid-cols-1`).

### B. Quy tắc Thu hẹp Độ cao Ô Điều khiển Lực (Compact Force Controls)
1. **Thiết kế Ô Lực cực gọn:**
   * Bỏ tiêu đề dư thừa như "Độ lớn F1" hay header row độc lập.
   * Đặt trực tiếp: **[Chấm màu] + [Ký hiệu F₁ = ] + [Lock] + [Thanh trượt] + [Ô nhập số N]** trên cùng 1 dòng hàng ngang để thu hẹp độ cao ngắn nhất có thể.
   * Giảm padding thẻ container lực xuống `p-2 space-y-1` (hoặc `p-2.5` khi không compact).
2. **Khung Mô phỏng (Canvas):** Giảm chiều cao tương ứng khi bật chế độ thu gọn (`280px` – `330px`).
3. **Tránh Tràn Số (Input Overflow Prevention):**
   * Đặt độ rộng cố định đủ chứa số thập phân (ví dụ `w-16` hoặc `w-20`).
   * Thêm CSS ẩn spinner mặc định của browser: `[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`.

---

## 3. QUY TẮC HIỂN THỊ KÝ HIỆU & CÔNG THỨC TOÁN - LÝ

1. **Phân biệt Vector ($\vec{F}$) và Độ lớn đại số ($F$):**
   * **Khi hiển thị Vector / Hướng / Hình vẽ canvas:** Có mũi tên vector trên đầu (VD: $\vec{F}_1$, $\vec{F}_2$, $\vec{F}_{hl}$).
   * **Khi hiển thị Độ lớn trong ô điều khiển / Ô nhập số thanh trượt:** **BỎ MŨI TÊN VECTOR TRÊN ĐẦU** (chỉ hiển thị $F_1 =$, $F_2 =$). Số $1, 2$ là chỉ số dưới (subscript) viết nhỏ phía dưới chữ $F$, không viết ngang hàng.
   * Không thêm các chữ rườm rà như "Độ lớn F1" vào ô nhập, chỉ giữ ký hiệu $F_1 =$.
2. **Đơn vị đo:**
   * Mọi số liệu phải kèm đơn vị chuẩn (VD: $\text{N}$, $\text{m/s}^2$, $\text{m/s}$, $\text{kg}$, $\text{deg }^\circ$).
   * Tỉ lệ xích (Scale): Hiển thị rõ quy đổi (VD: $1\text{ cm} = 1.4\text{ N}$).
3. **Làm tròn số (Precision Control):**
   * Cho phép chọn số chữ số thập phân ($0, 1, 2, 3$). Mặc định $1$ chữ số thập phân.

---

## 4. BẢNG MÀU & HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM)

* **Nền ứng dụng:** `bg-slate-950`
* **Nền thẻ/Khung:** `bg-slate-900` hoặc `bg-slate-800/80`
* **Đường viền (Border):** `border-slate-800` / `border-slate-700/80`
* **Văn bản:** `text-slate-100` (Chính), `text-slate-400` (Phụ), `text-slate-300` (Nhãn)
* **Lực thứ nhất ($F_1$):** Màu xanh dương (`#3b82f6` - `blue-500`)
* **Lực thứ hai ($F_2$):** Màu hồng/đỏ (`#ec4899` - `pink-500`)
* **Hợp lực ($F_{hl}$):** Màu xanh lá cây (`#10b981` - `emerald-500`)
* **Thành phần $F_x, F_y$:** Màu cyan (`#06b6d4`) / cam (`#f97316`)

---

## 5. BỘ ĐIỀU KHIỂN & TƯƠNG TÁC (INTERACTIVITY RULES)

1. **Tương tác Kép (Dual Control):**
   * Mọi tham số **phải hỗ trợ đồng thời**: Thanh trượt (Range Slider) + Ô nhập số (Numeric Input) + Drag kéo mút vector trên Canvas.
2. **Mô phỏng Chuyển động Động lực học (Dynamic Motion Simulation):**
   * Áp dụng $a = \frac{F_{hl}}{m}$, $v = a \cdot t$, $s = \frac{1}{2} a \cdot t^2$.
   * Cho phép chỉnh tốc độ mô phỏng, tạm dừng / chạy tiếp / reset.
3. **Tùy chọn hiển thị (Display Options):**
   * Đặt ở thanh Toolbar **phía trên Canvas**, bao gồm toggle: Lưới tọa độ, Hình bình hành, Hợp lực, Giá trị số, Góc $\alpha$.

---

## 6. MẪU BỘ KHUNG FILE COMPONENT CHUẨN (STANDARD PATTERN)

* `src/components/VectorCanvas.tsx`: Vẽ đồ họa vector SVG, lưới toạ độ, mũi tên, cung góc.
* `src/components/ForceControls.tsx`: Bộ thanh trượt + ô nhập thông số lực độ cao thu gọn.
* `src/components/MotionControls.tsx`: Bộ điều khiển động lực học $F = ma$.
* `src/components/tabs/TabName.tsx`: Layout ghép nối Toolbar (trên) + Canvas (dưới) + Controls (phải).
* `src/components/DataTable.tsx`: Bảng quản lý và lưu trữ dữ liệu thực hành.

