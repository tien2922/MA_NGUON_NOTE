import { Link } from "react-router-dom";

export default function MoreInfo() {
  return (
    <div className="font-display bg-background-dark text-white min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex h-full grow flex-col">
          {/* Top nav */}
          <header className="flex items-center justify-between border-b border-white/10 px-6 md:px-10 py-3">
            <div className="flex items-center gap-4">
              <div className="size-8 text-primary">
                <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Chí Tường Smart</h2>
            </div>
            <div className="hidden md:flex flex-1 justify-end gap-8">
              <div className="flex items-center gap-9 text-sm font-medium">
                <Link className="text-white/80 hover:text-white transition-colors" to="/">
                  Trang chủ
                </Link>
                <a className="text-white/80 hover:text-white transition-colors" href="#">
                  Liên hệ
                </a>
              </div>
              <Link
                to="/dangky"
                className="flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold leading-normal tracking-[0.015em] text-white hover:bg-primary/90 transition-colors"
              >
                Dùng thử miễn phí
              </Link>
            </div>
          </header>

          {/* Hero */}
          <div className="px-4 sm:px-6 lg:px-10">
            <div className="flex min-h-[480px] flex-col items-center justify-center gap-6 p-4 text-center">
              <div className="flex flex-col gap-2 max-w-3xl">
                <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">
                  Tìm hiểu về Chí Tường Smart
                </h1>
                <h2 className="text-white/80 text-sm sm:text-lg font-normal leading-normal">
                  Khám phá sứ mệnh, tầm nhìn và câu chuyện đằng sau ứng dụng ghi chú thông minh được thiết kế cho sự tập trung và hiệu quả.
                </h2>
              </div>
              <Link
                to="/dangky"
                className="flex h-11 sm:h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm sm:text-base font-bold text-white tracking-[0.015em] hover:bg-primary/90 transition-colors"
              >
                Bắt đầu miễn phí
              </Link>
            </div>
          </div>

          {/* Philosophy */}
          <section className="flex flex-col gap-10 px-4 sm:px-6 lg:px-10 py-16">
            <div className="flex flex-col gap-4 text-center items-center">
              <h2 className="text-[32px] sm:text-4xl font-black leading-tight tracking-[-0.033em] max-w-[720px]">
                Triết lý thiết kế của chúng tôi
              </h2>
              <p className="text-white/80 text-base leading-normal max-w-[720px]">
                Chúng tôi tin rằng công nghệ nên phục vụ con người, không phải ngược lại. Đây là những nguyên tắc định hướng cho mọi thứ chúng tôi làm tại
                Chí Tường Smart.
              </p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
              <Card icon="lightbulb" title="Tối giản để tập trung">
                Giao diện gọn gàng, không gây xao nhãng giúp bạn tập trung vào điều quan trọng nhất: ý tưởng của bạn.
              </Card>
              <Card icon="shield" title="Bảo mật là ưu tiên hàng đầu">
                Dữ liệu của bạn được mã hóa và bảo vệ. Chúng tôi cam kết bảo vệ quyền riêng tư của bạn một cách tuyệt đối.
              </Card>
              <Card icon="groups" title="Thiết kế vì người dùng">
                Mọi tính năng đều được xây dựng dựa trên phản hồi của cộng đồng người dùng để mang lại trải nghiệm tốt nhất.
              </Card>
            </div>
          </section>

          {/* Timeline */}
          <section className="px-4 sm:px-6 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-4">
              <h2 className="text-[32px] font-bold leading-tight">Câu chuyện của chúng tôi</h2>
              <p className="text-white/80 text-base leading-normal">
                Từ một ý tưởng nhỏ bé đến một công cụ được hàng ngàn người tin dùng, hành trình của Chí Tường Smart là một câu chuyện về đam mê và sự đổi mới
                không ngừng.
              </p>
            </div>
            <div className="grid grid-cols-[40px_1fr] gap-x-4">
              <TimelineItem icon="emoji_objects" title="Khởi đầu ý tưởng" time="Quý 1, 2022" />
              <TimelineItem icon="science" title="Phiên bản Beta ra mắt" time="Quý 4, 2022" />
              <TimelineItem icon="celebration" title="Đạt 10,000 người dùng" time="Quý 2, 2023" />
              <TimelineItem icon="rocket_launch" title="Ra mắt phiên bản 2.0" time="Quý 1, 2024" last />
            </div>
          </section>

          {/* Team */}
          <section className="flex flex-col gap-10 px-4 sm:px-6 lg:px-10 py-16">
            <div className="flex flex-col gap-4 text-center items-center">
              <h2 className="text-[32px] sm:text-4xl font-black leading-tight tracking-[-0.033em] max-w-[720px]">
                Đội ngũ phát triển
              </h2>
              <p className="text-white/80 text-base leading-normal max-w-[720px]">
                Những con người tâm huyết đứng sau thành công của Chí Tường Smart.
              </p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6">
              <TeamCard name="Hạ Chí Tiền" role="Founder & CEO" img="/image/tienvip.jpg" />
              <TeamCard name="Kyj" role="Lead Designer" img="/image/kyj.jpg" />
              <TeamCard name="Thảo" role="Lead Engineer" img="/image/thao.jpg" />
              <TeamCard name="Thảo 1" role="Marketing Manager" img="/image/thao1.jpg" />
            </div>
          </section>

          {/* Contact */}
          <section className="px-4 sm:px-6 lg:px-10 py-16">
            <div className="rounded-xl bg-white/5 border border-white/10 p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-4">
                <h2 className="text-[32px] font-bold leading-tight">Liên hệ với chúng tôi</h2>
                <p className="text-white/80">
                  Bạn có câu hỏi, góp ý hay muốn hợp tác? Đừng ngần ngại gửi tin nhắn cho chúng tôi. Đội ngũ Chí Tường Smart luôn sẵn sàng lắng nghe.
                </p>
              </div>
              <form className="flex flex-col gap-4">
                <input
                  className="w-full h-12 px-4 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/60 focus:ring-primary focus:border-primary"
                  placeholder="Tên của bạn"
                  type="text"
                />
                <input
                  className="w-full h-12 px-4 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/60 focus:ring-primary focus:border-primary"
                  placeholder="Email"
                  type="email"
                />
                <textarea
                  className="w-full p-4 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/60 focus:ring-primary focus:border-primary"
                  placeholder="Tin nhắn của bạn"
                  rows="4"
                />
                <button
                  className="flex w-full md:w-fit items-center justify-center rounded-lg h-12 px-5 bg-primary hover:bg-primary/90 text-white text-base font-bold tracking-[0.015em] transition-colors"
                  type="submit"
                >
                  Gửi tin nhắn
                </button>
              </form>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center py-8 border-t border-white/10">
            <p className="text-white/60 text-sm">© 2024 Chí Tường Smart. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, children }) {
  return (
    <div className="flex flex-1 gap-3 rounded-xl border border-white/10 bg-white/5 p-6 flex-col">
      <div className="text-primary">
        <span className="material-symbols-outlined !text-3xl">{icon}</span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold leading-tight">{title}</h3>
        <p className="text-white/60 text-sm leading-normal">{children}</p>
      </div>
    </div>
  );
}

function TimelineItem({ icon, title, time, last = false }) {
  return (
    <>
      <div className="flex flex-col items-center gap-1 pt-3">
        <div className="text-primary bg-primary/20 rounded-full p-2">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {!last && <div className="w-[1.5px] bg-white/20 h-2 grow" />}
      </div>
      <div className="flex flex-1 flex-col py-6">
        <p className="text-white text-base font-medium leading-normal">{title}</p>
        <p className="text-white/60 text-sm leading-normal">{time}</p>
      </div>
    </>
  );
}

function TeamCard({ name, role, img }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <img className="h-32 w-32 rounded-full object-cover" alt={name} src={img} />
      <div className="text-center">
        <h3 className="text-white text-lg font-bold">{name}</h3>
        <p className="text-primary text-sm font-medium">{role}</p>
      </div>
    </div>
  );
}

