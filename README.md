# 🎵 Spotifour Music Player Client 

Ứng dụng trình phát nhạc trực tuyến hiện đại, giao diện trực quan và trải nghiệm mượt mà, được phát triển bằng **ReactJS**, **Vite** và **TailwindCSS**. Kết nối liền mạch với Spring Boot REST API để cung cấp đầy đủ các tính năng của một dịch vụ phát nhạc cao cấp.

---

## 🔗 Các Repository Trong Dự Án

* 🖥️ **Repository Frontend (ReactJS):** [music-player-client](https://github.com/hBaoPhan/music-player-client)
* ⚙️ **Repository Backend (Spring Boot):** [music-player-api](https://github.com/hBaoPhan/music-player-api)

---

## ✨ Tính Năng Nổi Bật

### 🎧 Đối Với Người Dùng (User)
* **Khám Phá & Phát Nhạc**: Trang chủ hiển thị bài hát đề xuất ("Dành cho bạn"), danh sách Album và danh sách phát.
* **Trình Phát Nhạc Toàn Diện (Player Bar)**: Hỗ trợ tua nhạc, tăng giảm âm lượng, chế độ lặp lại (Repeat), xáo trộn (Shuffle), và yêu thích bài hát trực tiếp.
* **Bảng Xếp Hạng (Charts)**: Theo dõi xu hướng nghe nhạc thời gian thực với **Top Trending**, **Top Yêu Thích** và **Nghệ Sĩ Nổi Bật** trong tuần.
* **Danh Sách Phát Cá Nhân (Playlists)**: Tạo danh sách phát mới, thêm/bớt bài hát linh hoạt với ảnh bìa tự động ghép nghệ thuật (Collage).
* **Bài Hát Yêu Thích & Lịch Sử**: Quản lý bộ sưu tập nhạc yêu thích cá nhân và xem lại lịch sử nghe nhạc gần đây phân chia theo thời gian.
* **Bảo Mật & Xác Thực**: Đăng ký, đăng nhập tài khoản an toàn thông qua JWT (Access Token & Refresh Token) hoặc đăng nhập qua Google OAuth2.

### 🛡️ Đối Với Quản Trị Viên (Admin)
* **Bảng Số Liệu Thống Kê (Dashboard)**: Thống kê số lượng người dùng, bài hát, lượt nghe, lượt yêu thích, biểu đồ tăng trưởng và cơ cấu thể loại nhạc.
* **Quản Lý Bài Hát (Manage Songs)**: Thêm mới, chỉnh sửa thông tin bài hát (tải tệp âm thanh, hình ảnh) và xóa bài hát.
* **Quản Lý Người Dùng (Manage Users)**: Xem danh sách thành viên, cập nhật thông tin và phân quyền tài khoản (User / Admin).

---

## 🛠️ Công Nghệ Sử Dụng

* **Core**: [React 18](https://react.dev/), [Vite](https://vite.dev/) (Build tool siêu nhanh)
* **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
* **Routing**: [React Router DOM v6](https://reactrouter.com/)
* **State & Effects**: React Hooks (`useState`, `useEffect`, `useContext`, `useMemo`, `useCallback`)
* **API Client**: [Axios](https://axios-http.com/) (Hỗ trợ Request/Response Interceptors tự động refresh JWT token khi hết hạn)
* **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (`react-icons/fi`)

---

## 📂 Cấu Trúc Thư Mục Chính

```text
music-player-client/
├── src/
│   ├── components/      # Các component dùng chung (PlayerBar, Sidebar, Modal...)
│   ├── context/         # Quản lý Context API (Auth, Player, Toast, Songs)
│   ├── pages/           # Các trang giao diện chính (Home, Charts, Login, Admin...)
│   ├── services/        # Các API Client Services (axiosClient, userService...)
│   ├── styles/          # File style CSS thuần & TailwindCSS
│   ├── App.jsx          # Cấu hình Routing chính của ứng dụng
│   └── main.jsx         # Điểm khởi chạy của React App
├── package.json         # Danh sách thư viện & scripts
└── vite.config.js       # File cấu hình Vite
```

---

## ⚠️ Tuyên Bố Miễn Trừ Trách Nhiệm

Dự án này được thực hiện hoàn toàn phục vụ cho **mục đích học tập, nghiên cứu và phát triển cá nhân**. Các nguồn tài nguyên âm nhạc, hình ảnh được sử dụng trong hệ thống chỉ phục vụ cho mục đích phi thương mại.
