# Checklist kiểm thử thủ công

## Cài đặt
- [ ] D1 binding có tên `DB`.
- [ ] Có biến `ADMIN_PASSWORD`.
- [ ] Có biến `SESSION_SECRET`.
- [ ] Đã chạy `schema.sql`.

## Quản trị
- [ ] `/admin.html` hiển thị trang đăng nhập.
- [ ] Mật khẩu sai bị từ chối.
- [ ] Mật khẩu đúng vào được dashboard.
- [ ] `/api/admin/recipients` khi chưa đăng nhập trả 401.
- [ ] Tạo 27 người mẫu chỉ thêm mục còn thiếu, không nhân đôi.
- [ ] Có thể sửa tên và lời chúc.
- [ ] Có thể đặt mã riêng cho từng người.
- [ ] Mã trùng bị từ chối.
- [ ] Để trống mã khi sửa thì giữ mã cũ.
- [ ] Đổi mã thì mã mới hoạt động, mã cũ không còn hoạt động.
- [ ] Có thể xóa một người nhận.
- [ ] Đăng xuất thì API quản trị yêu cầu đăng nhập lại.

## Trang người nhận
- [ ] Mã đúng A trả về lời chúc A.
- [ ] Mã đúng B trả về lời chúc B.
- [ ] Mã sai trả về thông báo lỗi.
- [ ] Mục chưa có mã không thể được mở.
- [ ] Lời chúc hiển thị đúng xuống dòng.
- [ ] Bố cục không tràn ngang trên điện thoại.
