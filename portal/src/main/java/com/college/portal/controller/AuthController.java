package com.college.portal.controller;

import com.college.portal.model.Department;
import com.college.portal.model.User;
import com.college.portal.repository.DepartmentRepository;
import com.college.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.OPTIONS})
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    // Student / Teacher Registration with Department mapping
    @PostMapping("/register")
    public User registerUser(@RequestBody RegisterRequest request) {
        Department dept = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found!"));

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());
        user.setDepartment(dept);

        return userRepository.save(user);
    }

    // Login using LoginRequest DTO for perfect payload mapping
    @PostMapping("/login")
    public User loginUser(@RequestBody LoginRequest loginRequest) {
        System.out.println("Login attempt for email: " + loginRequest.getEmail());
        
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> {
                    System.out.println("Error: User not found with email: " + loginRequest.getEmail());
                    return new RuntimeException("User not found with this email!");
                });
        
        if (user.isBlocked()) {
            throw new RuntimeException("Your account has been blocked.");
        }

        if (!user.getPassword().equals(loginRequest.getPassword())) {
            System.out.println("Error: Password mismatch for user: " + loginRequest.getEmail());
            throw new RuntimeException("Invalid password!");
        }
        
        System.out.println("Login successful for: " + user.getEmail() + " with role: " + user.getRole());
        return user;
    }

    // Get all registered students for Teacher Directory
    @GetMapping("/students")
    public List<User> getAllStudents() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.STUDENT)
                .collect(Collectors.toList());
    }

    // Teacher updates student's password directly from dashboard
    @PutMapping("/update-student-password/{studentId}")
    public ResponseEntity<String> updateStudentPassword(@PathVariable Long studentId, @RequestBody Map<String, String> request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found!"));
        
        String newPassword = request.get("password");
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Password cannot be empty!");
        }

        student.setPassword(newPassword);
        userRepository.save(student);
        
        System.out.println("Password updated successfully for student ID: " + studentId);
        return ResponseEntity.ok("Student password updated successfully by teacher!");
    }

    // Helper DTO class for Login payload from frontend
    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    // Helper DTO class for receiving registration payload from frontend
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private User.Role role;
        private Long departmentId;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public User.Role getRole() { return role; }
        public void setRole(User.Role role) { this.role = role; }

        public Long getDepartmentId() { return departmentId; }
        public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    }
}