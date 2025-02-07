import React, { useState } from "react";
import { IMaskInput } from "react-imask"; // Используем react-imask
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    organizationAddress: "",
    organizationPhone: "",
    isAgreed: false,
  });

  const [showPassword, setShowPassword] = useState(false); // Для показа/скрытия пароля

  const validateForm = () => {
    const { name, firstName, lastName, organizationPhone, isAgreed } = data;

    // Валидация имени, фамилии и отчества (только русские буквы)
    const cyrillicRegex = /^[А-Яа-яЁё]+$/;
    if (!cyrillicRegex.test(name)) {
      toast.error("Имя должно содержать только русские буквы");
      return false;
    }
    if (!cyrillicRegex.test(firstName)) {
      toast.error("Фамилия должна содержать только русские буквы");
      return false;
    }
    if (!cyrillicRegex.test(lastName)) {
      toast.error("Отчество должно содержать только русские буквы");
      return false;
    }

    // Проверка телефона
    if (!organizationPhone || organizationPhone.length < 16) {
      toast.error("Введите корректный номер телефона");
      return false;
    }

    // Проверка согласия с условиями
    if (!isAgreed) {
      toast.error("Вы должны принять лицензионное соглашение");
      return false;
    }

    return true;
  };

  const registerUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const {
      username,
      email,
      password,
      confirmPassword,
      name,
      firstName,
      lastName,
      organizationName,
      organizationAddress,
      organizationPhone,
    } = data;

    try {
      const { data: response } = await axios.post("/register", {
        username,
        email,
        password,
        confirmPassword,
        name,
        firstName,
        lastName,
        organizationName,
        organizationAddress,
        organizationPhone,
      });
      if (response.error) {
        toast.error(response.error);
      } else {
        setData({ ...data, isAgreed: false }); // Сброс состояния
        toast.success("Регистрация прошла успешно!");
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <form
        onSubmit={registerUser}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* Имя */}
        <label>Имя</label>
        <input
          type="text"
          placeholder="Введите имя"
          value={data.name}
          onChange={(e) =>
            setData({ ...data, name: e.target.value.replace(/[^А-Яа-яЁё]/g, "") })
          }
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />

        {/* Фамилия */}
        <label>Фамилия</label>
        <input
          type="text"
          placeholder="Введите фамилию"
          value={data.firstName}
          onChange={(e) =>
            setData({
              ...data,
              firstName: e.target.value.replace(/[^А-Яа-яЁё]/g, ""),
            })
          }
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />

        {/* Отчество */}
        <label>Отчество</label>
        <input
          type="text"
          placeholder="Введите отчество"
          value={data.lastName}
          onChange={(e) =>
            setData({
              ...data,
              lastName: e.target.value.replace(/[^А-Яа-яЁё]/g, ""),
            })
          }
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />

        {/* Логин */}
        <label>Логин</label>
        <input
          type="text"
          placeholder="Введите логин"
          value={data.username}
          onChange={(e) => setData({ ...data, username: e.target.value })}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />

        {/* Email */}
        <label>Email</label>
        <input
          type="email"
          placeholder="Введите email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />

        {/* Пароль */}
        <label>Пароль</label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Введите пароль"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "100%",
            }}
          />
          <button
            type="button"
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
            }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Скрыть" : "Показать"}
          </button>
        </div>

        {/* Подтверждение пароля */}
        <label>Подтверждение пароля</label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Введите повторно пароль"
            value={data.confirmPassword}
            onChange={(e) =>
              setData({ ...data, confirmPassword: e.target.value })
            }
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "100%",
            }}
          />
          <button
            type="button"
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
            }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Скрыть" : "Показать"}
          </button>
        </div>

        {/* Название организации */}
        <label>Название организации</label>
        <input
          type="text"
          placeholder="Введите название организации"
          value={data.organizationName}
          onChange={(e) =>
            setData({ ...data, organizationName: e.target.value })
          }
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />

        {/* Адрес организации */}
        <label>Адрес организации</label>
        <input
          type="text"
          placeholder="Введите адрес организации"
          value={data.organizationAddress}
          onChange={(e) =>
            setData({ ...data, organizationAddress: e.target.value })
          }
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />

        {/* Телефон организации */}
        <label>Телефон организации</label>
        <IMaskInput
          mask="+{7} (000) 000-00-00"
          value={data.organizationPhone}
          onAccept={(value) => setData({ ...data, organizationPhone: value })}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />

        {/* Чекбокс для принятия условий */}
        <label>
          <input
            type="checkbox"
            checked={data.isAgreed}
            onChange={(e) =>
              setData({ ...data, isAgreed: e.target.checked })
            }
            style={{
              marginRight: "10px",
            }}
          />
          Я принимаю лицензионное соглашение
        </label>

        {/* Кнопка регистрации */}
        <button
          type="submit"
          style={{
            padding: "10px",
            background: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Регистрация
        </button>
      </form>
    </div>
  );
}