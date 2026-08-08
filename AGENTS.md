# QUY TẮC MÔ PHỎNG & BỐ CỤC CHO BÀI HỌC VẬT LÝ / KHOA HỌC

Mọi mô phỏng tương tác vật lý được tạo mới hoặc mở rộng cần tuân thủ cấu trúc giao diện và quy tắc hiển thị sau:

## 1. Bố cục & Vị trí Thành phần
- **Cột trái (Khung Mô Phỏng - 7 cols):**
  - **Khung Tùy chọn hiển thị (Display Options Toolbar):** **BẮT BUỘC ĐẶT Ở TRÊN (TRƯỚC)** khung vẽ mô phỏng (VectorCanvas).
  - **Khung Mô phỏng (VectorCanvas / Canvas Area):** Đặt ở dưới thanh Tùy chọn hiển thị.
- **Cột phải (Bảng Điều khiển - 5 cols):**
  - Các ô điều khiển độ lớn và góc lực.
  - Ô điều khiển động lực học $F = ma$.
  - Bảng lý thuyết & Câu hỏi mở rộng.

## 2. Ô Điều Khiển & Thu Nhẹp Độ Cao (Force Controls UI)
- Ô lực có độ cao cực ngắn, không dùng chữ dư thừa như "Độ lớn F1".
- Dòng hiển thị: `[Chấm màu] + [Ký hiệu F₁ = ] + [Lock] + [Thanh trượt] + [Ô nhập số N]`.
- Giảm padding tối đa (`p-2`), giữ layout nằm gọn gàng trên 1 hàng.

## 3. Quy tắc Ký hiệu Vector vs Độ lớn & Hiển thị trên Canvas
- **Trong ô điều khiển độ lớn / nhãn thanh trượt:** **BỎ MŨI TÊN VECTOR TRÊN ĐẦU** (chỉ ghi $F_1 =$, $F_2 =$). Chỉ số $1, 2$ viết dạng subscript ở góc dưới chữ $F$.
- **Trong hình vẽ Canvas / Tên vector chỉ hướng:** Giữ mũi tên vector trên đầu ($\vec{F}_1$, $\vec{F}_2$, $\vec{F}_{hl}$).
- **Trên khung mô phỏng (Canvas Labels):** **BỎ DẤU `=` SAU VÉC-TƠ LỰC**, thay bằng dấu ngoặc vuông `[...]` chứa giá trị số và đơn vị phía sau (ví dụ: $\vec{F}_1 [10.0\text{ N}]$, $\vec{F}_2 [15.0\text{ N}]$, $\vec{F}_{hl} [21.2\text{ N}]$).

## 4. Giao diện Đơn giản & Tinh gọn
- Bỏ hoàn toàn chế độ Học sinh / Giáo viên, rút gọn tối đa giao diện làm việc.

## 5. Chi tiết xem thêm trong `SIMULATION_RULES.md`

