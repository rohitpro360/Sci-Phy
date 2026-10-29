package com.college.portal.repository;

import com.college.portal.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface Subjectrepo extends JpaRepository<Subject, Long> {
    List<Subject> findByDepartmentId(Long departmentId);
}