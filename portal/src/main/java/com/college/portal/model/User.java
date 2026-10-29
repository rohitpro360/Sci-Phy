package com.college.portal.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // BCrypt Hashed password

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // STUDENT, TEACHER, ADMIN

    @Column(nullable = false)
    private boolean blocked = false; // Added field for block/unblock support

    // Relationship: User can belong to a Department (nullable for Admin)
    @ManyToOne(fetch = FetchType.EAGER) // FetchType EAGER taaki response me department code/name direct mil jaye
    @JoinColumn(name = "department_id")
    private Department department;

    // Role Enum
    public enum Role {
        STUDENT, TEACHER, ADMIN
    }

    // Constructors
    public User() {}

    public User(String name, String email, String password, Role role, Department department) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.department = department;
        this.blocked = false;
    }

    //otp feature

    private String otp;
private LocalDateTime otpExpiry;

// Getters and Setters
public String getOtp() { return otp; }
public void setOtp(String otp) { this.otp = otp; }

public LocalDateTime getOtpExpiry() { return otpExpiry; }
public void setOtpExpiry(LocalDateTime otpExpiry) { this.otpExpiry = otpExpiry; }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isBlocked() { return blocked; }
    public void setBlocked(boolean blocked) { this.blocked = blocked; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    private String phone;

// Getters and Setters
public String getPhone() { return phone; }
public void setPhone(String phone) { this.phone = phone; }
}