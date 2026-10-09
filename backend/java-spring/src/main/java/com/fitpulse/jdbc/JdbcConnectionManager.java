package com.fitpulse.jdbc;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Manages native JDBC Connections and transactional commit/rollback lifecycles.
 * Demonstrates:
 * - Real JDBC Connection handling.
 * - Explicit ACID Transaction Management (setAutoCommit(false), commit(), rollback()).
 * - Clean resource closure via try-with-resources.
 */
@Component
public class JdbcConnectionManager {

    private final DataSource dataSource;

    @Autowired
    public JdbcConnectionManager(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Obtains a live JDBC connection from the underlying data source.
     *
     * @return active java.sql.Connection
     * @throws SQLException on connection acquisition failure
     */
    public Connection getConnection() throws SQLException {
        Connection conn = dataSource.getConnection();
        if (conn == null || conn.isClosed()) {
            throw new SQLException("Failed to obtain valid active JDBC connection from DataSource");
        }
        return conn;
    }

    /**
     * Functional interface for transactional JDBC execution blocks.
     *
     * @param <T> result type
     */
    @FunctionalInterface
    public interface JdbcTransactionCallback<T> {
        T doInTransaction(Connection conn) throws SQLException;
    }

    /**
     * Executes a callback within an explicit ACID transaction block.
     * Automatically commits on success and rolls back on SQLException.
     *
     * @param action the transactional callback
     * @param <T> return type
     * @return result of the action
     * @throws SQLException on database error
     */
    public <T> T executeInTransaction(JdbcTransactionCallback<T> action) throws SQLException {
        Connection conn = getConnection();
        boolean originalAutoCommit = conn.getAutoCommit();
        try {
            conn.setAutoCommit(false);
            T result = action.doInTransaction(conn);
            conn.commit();
            return result;
        } catch (SQLException | RuntimeException ex) {
            try {
                conn.rollback();
            } catch (SQLException rollbackEx) {
                ex.addSuppressed(rollbackEx);
            }
            throw ex;
        } finally {
            try {
                conn.setAutoCommit(originalAutoCommit);
            } catch (SQLException ignored) {}
            try {
                conn.close();
            } catch (SQLException ignored) {}
        }
    }
}
