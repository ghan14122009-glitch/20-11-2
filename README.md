# Little Blossom — Website lời chúc 20/10

Website responsive cho 26 bạn nữ và 1 cô giáo:
- Mỗi người có một mã riêng; chỉ người nhập đúng mã mới nhận được lời chúc tương ứng.
- Trang quản trị riêng tại `/admin.html`.
- Quản lý người nhận, tên, mã và nội dung lời chúc.
- Mã được băm SHA-256 ở phía máy chủ, không gửi danh sách mã xuống trình duyệt.
- Phiên quản trị dùng cookie `HttpOnly`, `Secure`, `SameSite=Strict`, hết hạn sau 8 giờ.
- Frontend tĩnh + Cloudflare Pages Functions + Cloudflare D1. Không cần API AI, không có chi phí AI.

> Lưu ý: đây là lớp bảo vệ cơ bản phù hợp cho món quà lớp học, không phải hệ thống bí mật có mức bảo mật cao. Người nhận vẫn có thể chia sẻ mã cho nhau. Không dùng mật khẩu quản trị trùng với mật khẩu cá nhân.

## Cấu trúc

- `index.html`: trang mở lời chúc.
- `admin.html`: trang quản trị.
- `assets/`: CSS và JavaScript trình duyệt.
- `functions/api/`: API chạy phía máy chủ Cloudflare.
- `schema.sql`: cấu trúc cơ sở dữ liệu D1.

## Triển khai miễn phí bằng Cloudflare Pages + D1

Bạn cần một tài khoản Cloudflare và một tài khoản GitHub. Các tên mục trong bảng điều khiển có thể thay đổi đôi chút.

### 1. Đưa mã nguồn lên GitHub
1. Giải nén `20-10-loi-chuc.zip`.
2. Tạo repository mới trên GitHub, ví dụ `loi-chuc-20-10`.
3. Tải toàn bộ các tệp/thư mục trong thư mục đã giải nén lên repository (không tải file ZIP thay cho nội dung).
4. Đảm bảo `index.html`, `admin.html`, `assets/`, `functions/`, `schema.sql` nằm ở thư mục gốc của repository.

### 2. Tạo cơ sở dữ liệu D1
1. Mở https://dash.cloudflare.com/ và chọn **Workers & Pages → D1 SQL Database** (tên menu có thể thay đổi).
2. Tạo database, ví dụ `loi-chuc-2010`.
3. Mở database → tab **Console**.
4. Sao chép toàn bộ nội dung `schema.sql`, dán vào console và chạy.
5. Ghi lại tên database. Không cần nhập sẵn dữ liệu; trang quản trị sẽ tạo danh sách.

### 3. Tạo Pages project
1. Trong Cloudflare, mở **Workers & Pages → Create → Pages → Connect to Git** (hoặc luồng tạo Pages từ repository).
2. Kết nối GitHub và chọn repository `loi-chuc-20-10`.
3. Framework preset chọn **None** / **No framework**.
4. Build command: để trống.
5. Build output directory: `/` hoặc `.` theo giao diện Cloudflare.
6. Bấm **Save and Deploy**. Cloudflare sẽ cấp cho bạn một địa chỉ dạng `ten-web.pages.dev`.

**Quan trọng:** vì đây là Pages Functions, thư mục `functions/` phải nằm ở gốc dự án; không đặt nó trong `assets/` hay thư mục output con.

### 4. Kết nối D1 với Pages
1. Mở Pages project → **Settings → Functions → D1 database bindings**.
2. Thêm binding:
   - Variable name / Binding name: `DB`
   - D1 database: chọn `loi-chuc-2010` (database vừa tạo).
3. Lưu thay đổi rồi redeploy project.

### 5. Đặt mật khẩu quản trị và bí mật phiên
Trong Pages project, mở **Settings → Variables and Secrets** (hoặc Settings → Environment variables):
- `ADMIN_PASSWORD`: mật khẩu bạn tự đặt, dài và khó đoán.
- `SESSION_SECRET`: chuỗi ngẫu nhiên dài ít nhất 32 ký tự, dùng để ký cookie phiên. Ví dụ tạo trên máy bằng Python:
  ```python
  import secrets
  print(secrets.token_urlsafe(48))
  ```
  Dán kết quả làm `SESSION_SECRET`. Đánh dấu giá trị là **Secret** nếu Cloudflare cho phép.
3. Thêm biến cho **Production**; nếu muốn thử Preview deployments, đặt riêng ở môi trường Preview.
4. Lưu và redeploy.

Không đưa `ADMIN_PASSWORD` hoặc `SESSION_SECRET` vào file JavaScript/HTML, GitHub, ảnh chụp công khai hay chia sẻ cho người nhận.

### 6. Thiết lập danh sách 27 người
1. Mở địa chỉ Pages của bạn, ví dụ `https://ten-web.pages.dev/admin.html`.
2. Đăng nhập bằng `ADMIN_PASSWORD`.
3. Bấm **Tạo 27 người mẫu**. Website tạo 26 mục “Bạn nữ 01…26” và 1 mục “Cô giáo”.
4. Bấm **Sửa** từng người:
   - Đổi tên thành tên thật.
   - Nhập mã riêng do bạn tự chọn (ít nhất 3 ký tự; nên tránh mã quá dễ đoán như `123`).
   - Sửa lời chúc nếu muốn.
   - Bấm **Lưu thay đổi**.
5. Ghi lại mã cho từng người trong một nơi riêng tư. Vì mã được băm, website không thể hiển thị lại mã cũ sau khi lưu. Nếu quên, hãy đặt mã mới cho người đó.

Bạn cũng có thể bấm **Thêm người** để tạo từng mục thủ công. Mã trùng sẽ bị từ chối.

### 7. Kiểm tra trước khi chia sẻ
- Mã đúng A mở đúng tên và lời chúc A.
- Mã B mở lời chúc B, không phải A.
- Mã sai hoặc chưa đặt mã hiển thị thông báo lỗi.
- Đăng xuất quản trị rồi mở `/api/admin/recipients`: phải bị từ chối bằng HTTP 401.
- Thử trên điện thoại và máy tính.
- Đừng chia sẻ đường dẫn `/admin.html` cùng mật khẩu quản trị cho cả lớp.

## Kiểm thử tự động tối thiểu

Sau khi triển khai, mở DevTools → Console để xem lỗi JavaScript nếu có. Bạn cũng có thể kiểm tra API bằng curl (thay URL và mã của bạn):

```bash
# Mã sai: kỳ vọng HTTP 404
curl -i -X POST "https://TEN-WEB.pages.dev/api/redeem" \
  -H "Content-Type: application/json" \
  -d '{"code":"ma-khong-dung"}'

# Chưa đăng nhập quản trị: kỳ vọng HTTP 401
curl -i "https://TEN-WEB.pages.dev/api/admin/recipients"
```

## Chi phí

- Cloudflare Pages: có gói miễn phí.
- Cloudflare D1: có hạn mức miễn phí; website lớp học nhỏ thường rất nhẹ.
- GitHub: gói miễn phí đủ cho repository riêng tư/công khai.
- Không dùng dịch vụ AI trả phí.
- Tên miền riêng không bắt buộc; có thể dùng tên miền miễn phí `pages.dev`.

Hạn mức và giao diện nhà cung cấp có thể thay đổi theo thời gian. Kiểm tra trang giá chính thức của Cloudflare trước khi triển khai nếu cần bảo đảm chi phí.

## Bảo mật và giới hạn

- Mã truy cập được băm SHA-256 trước khi lưu. Vì mã ngắn có thể bị đoán, hãy chọn mã đủ dài/khó đoán.
- API không gửi danh sách mã truy cập xuống trình duyệt.
- Mật khẩu quản trị và khóa phiên được lưu trong cài đặt Cloudflare, không nằm trong frontend.
- Nên bật xác thực hai bước cho tài khoản Cloudflare.
- Không lưu thông tin nhạy cảm trong lời chúc.
- Đây là dự án đơn giản cho hoạt động lớp học; chưa có giới hạn tốc độ chống thử mã, nhật ký kiểm toán, khôi phục mật khẩu hay phân quyền nhiều quản trị viên.
