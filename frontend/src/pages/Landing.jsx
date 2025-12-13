import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
      <div className="flex min-h-screen flex-col">
        <header className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined !text-2xl">edit_note</span>
            </div>
            <span className="text-xl font-bold">Chí Tường Smart</span>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Link
              className="flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg px-4 text-sm font-bold text-text-primary-light transition-colors hover:bg-gray-100 dark:text-text-primary-dark dark:hover:bg-gray-800"
              to="/dangnhap"
            >
              <span>Đăng nhập</span>
            </Link>
            <Link
              className="flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-primary/90"
              to="/dangky"
            >
              <span>Đăng ký</span>
            </Link>
          </div>
        </header>

        <main className="flex-grow">
          <section className="py-16 text-center md:py-24 lg:py-32">
            <div className="container mx-auto px-6">
              <div className="flex flex-col items-center gap-6">
                <h1 className="text-4xl font-extrabold leading-tight tracking-tighter text-text-primary-light dark:text-text-primary-dark sm:text-5xl md:text-6xl">
                  Ghi Chú Thông Minh, Tổ Chức Tối Ưu
                </h1>
                <p className="mx-auto max-w-3xl text-lg text-text-secondary-light dark:text-text-secondary-dark md:text-xl">
                  Chí Tường Smart là giải pháp hoàn hảo để giải phóng ý tưởng, sắp xếp công việc và không bao giờ bỏ lỡ bất kỳ thông tin quan trọng nào. Trải nghiệm ứng dụng ghi chú mạnh mẽ và trực quan của chúng tôi ngay hôm nay.
                </p>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                  <Link
                    className="flex h-12 min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-base font-bold text-white transition-colors hover:bg-primary/90"
                    to="/dangky"
                  >
                    <span className="truncate">Bắt đầu miễn phí</span>
                  </Link>
                  <Link
                    className="flex h-12 min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-card-light px-6 text-base font-bold text-text-primary-light ring-1 ring-inset ring-gray-200 transition-colors hover:bg-gray-100 dark:bg-card-dark dark:text-text-primary-dark dark:ring-gray-700 dark:hover:bg-gray-800"
                    to="/timhieuthem"
                  >
                    <span className="truncate">Tìm hiểu thêm</span>
                  </Link>
                </div>
              </div>
              <div className="mt-16 rounded-xl bg-card-light p-4 shadow-2xl shadow-primary/10 ring-1 ring-black/5 dark:bg-card-dark dark:shadow-primary/20 dark:ring-white/10 md:mt-24">
                <img
                  alt="Minh họa ứng dụng Chí Tường Smart"
                  className="rounded-lg"
                  height="720"
                  src="/image/banner_note.jpg"
                  style={{ aspectRatio: "1280/720", objectFit: "cover" }}
                  width="1280"
                />
              </div>
            </div>
          </section>

          <section className="py-16 md:py-24">
            <div className="container mx-auto px-6">
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Tính năng vượt trội cho công việc của bạn</h2>
                <p className="mt-4 text-lg text-text-secondary-light dark:text-text-secondary-dark">
                  Khám phá cách Chí Tường Smart giúp bạn làm việc hiệu quả và sáng tạo hơn mỗi ngày.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <Feature icon="bolt" title="Nhanh chóng & Hiệu quả" desc="Ghi lại ý tưởng ngay lập tức với giao diện tối giản và hiệu suất mượt mà." />
                <Feature icon="cloud_sync" title="Đồng bộ đa nền tảng" desc="Truy cập ghi chú của bạn mọi lúc, mọi nơi trên tất cả các thiết bị." />
                <Feature
                  icon="shield"
                  title="Bảo mật & Riêng tư"
                  desc="Dữ liệu của bạn được mã hóa và bảo vệ an toàn; chỉ bạn có quyền truy cập."
                />
              </div>
            </div>
          </section>

          <section className="py-16 md:py-24">
            <div className="container mx-auto px-6">
              <div className="mx-auto max-w-4xl rounded-xl bg-primary/10 p-8 text-center dark:bg-card-dark md:p-12">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Sẵn sàng để sắp xếp cuộc sống của bạn?</h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary-light dark:text-text-secondary-dark">
                  Tham gia cùng hàng ngàn người dùng và bắt đầu hành trình làm việc hiệu quả hơn với Chí Tường Smart.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    className="flex h-12 w-full min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-base font-bold text-white transition-colors hover:bg-primary/90 sm:w-auto"
                    to="/dangky"
                  >
                    <span className="truncate">Đăng ký ngay</span>
                  </Link>
                  <Link
                    className="flex h-12 w-full min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-card-light px-6 text-base font-bold text-text-primary-light ring-1 ring-inset ring-gray-200 transition-colors hover:bg-gray-100 dark:bg-card-dark dark:text-text-primary-dark dark:ring-gray-700 dark:hover:bg-gray-800 sm:w-auto"
                    to="/dangnhap"
                  >
                    <span className="truncate">Đăng nhập</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-card-light dark:bg-card-dark py-8">
          <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 md:flex-row">
            <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">© 2024 Chí Tường Smart. All rights reserved.</span>
            <div className="flex items-center gap-4 text-text-secondary-light dark:text-text-secondary-dark">
              <a className="transition-colors hover:text-primary" href="#">
                <span className="material-symbols-outlined">photo_camera</span>
              </a>
              <a className="transition-colors hover:text-primary" href="#">
                <span className="material-symbols-outlined">group</span>
              </a>
              <a className="transition-colors hover:text-primary" href="#">
                <span className="material-symbols-outlined">share</span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card-light dark:bg-card-dark p-6 text-left shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{title}</h3>
      <p className="text-base text-text-secondary-light dark:text-text-secondary-dark">{desc}</p>
    </div>
  );
}

