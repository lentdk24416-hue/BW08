// ===================== CÂU 8: QUẢN LÝ ĐƠN HÀNG (ADMIN) =====================
var dsNhanVien = [], dsKhach = [], dsSP = [], dsDon = [];

function timTheoId(ds, id) {
  for (var i = 0; i < ds.length; i++) if (ds[i].id == id) return ds[i];
  return null;
}

// ---------- Đăng nhập bằng employees.json ----------
document.getElementById("formDangNhap").onsubmit = function (e) {
  e.preventDefault();
  var u = document.getElementById("user").value.trim();
  var p = document.getElementById("pass").value;
  var nv = null;
  for (var i = 0; i < dsNhanVien.length; i++) {
    if (dsNhanVien[i].username == u && dsNhanVien[i].password == p) nv = dsNhanVien[i];
  }
  if (nv == null) {
    document.getElementById("loiDangNhap").innerHTML = "Sai tên đăng nhập hoặc mật khẩu";
    return;
  }
  try { sessionStorage.setItem("nhanVien", JSON.stringify(nv)); } catch (er) { }
  vaoDashboard(nv);
};

function dangXuat() {
  try { sessionStorage.removeItem("nhanVien"); } catch (e) { }
  location.reload();
}

function vaoDashboard(nv) {
  document.getElementById("manHinhDangNhap").classList.add("an");
  document.getElementById("dashboard").classList.remove("an");
  document.getElementById("nutDangXuat").classList.remove("an");
  document.getElementById("tenNV").innerHTML = nv.hoTen + " (" + nv.chucVu + ")";
  taiDuLieuDon();
}

// ---------- Đọc carts.xml + đơn mới từ localStorage ----------
function taiDuLieuDon() {
  docSanPham(function (ds) {
    dsSP = ds;
    taiFile("data/carts.xml", function (xhr) {
      var xmlDoc = xhr.responseXML;
      var dsHD = xmlDoc.getElementsByTagName("hoaDon");
      dsDon = [];
      for (var i = 0; i < dsHD.length; i++) {
        var hd = dsHD[i];
        var dsCT = hd.getElementsByTagName("sanPham");
        var chiTiet = [], tong = 0;
        for (var k = 0; k < dsCT.length; k++) {
          var ct = {
            id: dsCT[k].getAttribute("id"),
            mauSac: dsCT[k].getAttribute("mauSac"),
            size: dsCT[k].getAttribute("size"),
            soLuong: parseInt(dsCT[k].getAttribute("soLuong")),
            donGia: parseFloat(dsCT[k].getAttribute("donGia"))
          };
          tong += ct.soLuong * ct.donGia;
          chiTiet.push(ct);
        }
        dsDon.push({
          maHD: hd.getAttribute("maHD"),
          ngayTao: hd.getAttribute("ngayTao"),
          trangThai: hd.getAttribute("trangThai"),
          nhanVien: layText(hd, "nhanVien"),
          khachHang: layText(hd, "khachHang"),
          chiTiet: chiTiet,
          tongTien: tong
        });
      }
      // Đơn khách đặt từ trang bán hàng (Câu 7) lưu trong localStorage
      dsDon = dsDon.concat(docLocal("donHang", []));
      // Trạng thái admin đã sửa (lưu riêng để không mất khi tải lại)
      var trangThaiDaSua = docLocal("trangThaiDon", {});
      for (var j = 0; j < dsDon.length; j++) {
        if (trangThaiDaSua[dsDon[j].maHD]) dsDon[j].trangThai = trangThaiDaSua[dsDon[j].maHD];
      }
      veTatCa();
    });
  });
}

function tenKhach(don) {
  var kh = timTheoId(dsKhach, don.khachHang);
  if (kh) return kh.hoTen;
  return don.hoTen ? don.hoTen + " <small>(khách lẻ)</small>" : don.khachHang;
}

function veTatCa() {
  veThongKe();
  veBangDon();
  veBieuDo();
  veBangNhanVien();
}

function donHopLe(don) { return don.trangThai != "Đã hủy"; }

function veThongKe() {
  var doanhThu = 0, soSP = 0, khach = {};
  for (var i = 0; i < dsDon.length; i++) {
    if (!donHopLe(dsDon[i])) continue;
    doanhThu += dsDon[i].tongTien;
    khach[dsDon[i].khachHang] = true;
    for (var k = 0; k < dsDon[i].chiTiet.length; k++) soSP += dsDon[i].chiTiet[k].soLuong;
  }
  document.getElementById("tkDon").innerHTML = dsDon.length;
  document.getElementById("tkDoanhThu").innerHTML = dinhDangTien(doanhThu);
  document.getElementById("tkSoSP").innerHTML = soSP;
  document.getElementById("tkKhach").innerHTML = Object.keys(khach).length;
}

function veBangDon() {
  var loc = document.getElementById("locTrangThai").value;
  var html = "";
  var cacTrangThai = ["Chờ xử lý", "Đang giao", "Đã giao", "Đã hủy"];
  for (var i = 0; i < dsDon.length; i++) {
    var d = dsDon[i];
    if (loc != "" && d.trangThai != loc) continue;
    var ct = "";
    for (var k = 0; k < d.chiTiet.length; k++) {
      var sp = timTheoId(dsSP, d.chiTiet[k].id);
      ct += (sp ? sp.title.substring(0, 25) : "SP " + d.chiTiet[k].id) +
        " <small>(" + d.chiTiet[k].mauSac + (d.chiTiet[k].size ? "/" + d.chiTiet[k].size : "") + ")</small> x" +
        d.chiTiet[k].soLuong + "<br>";
    }
    var nv = timTheoId(dsNhanVien, d.nhanVien);
    var chon = "<select onchange=\"doiTrangThai('" + d.maHD + "', this.value)\">";
    for (var t = 0; t < cacTrangThai.length; t++) {
      chon += "<option" + (cacTrangThai[t] == d.trangThai ? " selected" : "") + ">" + cacTrangThai[t] + "</option>";
    }
    chon += "</select>";
    html += "<tr><td>" + d.maHD + "</td><td>" + d.ngayTao + "</td><td>" + tenKhach(d) + "</td>" +
      "<td>" + (nv ? nv.hoTen : "<small>Chưa phân công</small>") + "</td><td>" + ct + "</td>" +
      "<td>" + dinhDangTien(d.tongTien) + "</td><td>" + chon + "</td></tr>";
  }
  document.getElementById("bangDon").innerHTML = html == "" ? "<tr><td colspan='7'>Không có đơn</td></tr>" : html;
}

function doiTrangThai(maHD, trangThai) {
  var daSua = docLocal("trangThaiDon", {});
  daSua[maHD] = trangThai;
  luuLocal("trangThaiDon", daSua);
  for (var i = 0; i < dsDon.length; i++) if (dsDon[i].maHD == maHD) dsDon[i].trangThai = trangThai;
  veThongKe(); veBieuDo(); veBangNhanVien();
}

// Thống kê số lượng bán theo sản phẩm → biểu đồ cột ngang bằng CSS
function veBieuDo() {
  var dem = {};
  for (var i = 0; i < dsDon.length; i++) {
    if (!donHopLe(dsDon[i])) continue;
    for (var k = 0; k < dsDon[i].chiTiet.length; k++) {
      var ct = dsDon[i].chiTiet[k];
      dem[ct.id] = (dem[ct.id] || 0) + ct.soLuong;
    }
  }
  var mang = [];
  for (var id in dem) mang.push({ id: id, sl: dem[id] });
  mang.sort(function (a, b) { return b.sl - a.sl; });
  var max = mang.length ? mang[0].sl : 1;
  var html = "";
  for (var j = 0; j < mang.length && j < 10; j++) {
    var sp = timTheoId(dsSP, mang[j].id);
    html += "<div class='hang'><span class='ten'>" + (sp ? sp.title : "SP " + mang[j].id) + "</span>" +
      "<div class='thanh' style='width:" + (mang[j].sl / max * 60) + "%'></div>" +
      "<span class='so'>" + mang[j].sl + "</span></div>";
  }
  document.getElementById("bieuDo").innerHTML = html || "Chưa có dữ liệu";
}

function veBangNhanVien() {
  var html = "";
  for (var i = 0; i < dsNhanVien.length; i++) {
    var nv = dsNhanVien[i], soDon = 0, dt = 0;
    for (var k = 0; k < dsDon.length; k++) {
      if (dsDon[k].nhanVien == nv.id && donHopLe(dsDon[k])) { soDon++; dt += dsDon[k].tongTien; }
    }
    html += "<tr><td>" + nv.id + "</td><td>" + nv.hoTen + "</td><td>" + nv.chucVu + "</td><td>" + soDon + "</td><td>" + dinhDangTien(dt) + "</td></tr>";
  }
  document.getElementById("bangNV").innerHTML = html;
}

// ---------- Khởi động: tải nhân viên + khách hàng, giữ đăng nhập trong phiên ----------
window.onload = function () {
  docJSON("data/employees.json", function (data) {
    dsNhanVien = data.employees;
    docJSON("data/customers.json", function (d2) {
      dsKhach = d2.customers;
      var nv = null;
      try { nv = JSON.parse(sessionStorage.getItem("nhanVien")); } catch (e) { }
      if (nv) vaoDashboard(nv);
    });
  });
};
