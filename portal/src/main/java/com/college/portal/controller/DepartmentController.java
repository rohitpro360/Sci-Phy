package com.college.portal.controller;

import com.college.portal.model.Department;
import com.college.portal.model.User;
import com.college.portal.repository.DepartmentRepository;
import com.college.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all departments
    @GetMapping
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    // Teacher / Admin can create a new department
    @PostMapping
    public Department createDepartment(@RequestBody Department department) {
        return departmentRepository.save(department);
    }

    // Teacher / Admin can update an existing department
    @PutMapping("/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable Long id, @RequestBody Department departmentDetails) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));

        department.setName(departmentDetails.getName());
        department.setCode(departmentDetails.getCode());
        department.setYear(departmentDetails.getYear());

        Department updatedDepartment = departmentRepository.save(department);
        return ResponseEntity.ok(updatedDepartment);
    }

    // Safe Department Deletion (Handles Foreign Key constraints automatically)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDepartment(@PathVariable Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found!"));

        // 1. Is department se jude sabhi users ka department reference null kar do
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (user.getDepartment() != null && user.getDepartment().getId().equals(id)) {
                user.setDepartment(null);
                userRepository.save(user);
            }
        }

        // 2. Ab department ko safely delete kar do
        departmentRepository.delete(dept);
        
        System.out.println("Department deleted successfully: ID " + id);
        return ResponseEntity.ok("Department deleted successfully!");
    }
}