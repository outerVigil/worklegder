package com.example

import com.example.data.model.FinancialSummary
import org.junit.Assert.assertEquals
import org.junit.Test

class ExampleUnitTest {
  @Test
  fun addition_isCorrect() {
    assertEquals(4, 2 + 2)
  }

  @Test
  fun `verify financial ledger balance formula`() {
    val allocated = 12500.0
    val approved = 5200.0
    val pending = 850.0

    val summary = FinancialSummary.calculate(allocated, approved, pending)

    assertEquals(12500.0, summary.totalAllocated, 0.001)
    assertEquals(5200.0, summary.approvedWithdrawals, 0.001)
    assertEquals(850.0, summary.pendingWithdrawals, 0.001)
    assertEquals(6450.0, summary.availableBalance, 0.001)
  }

  @Test
  fun `verify financial ledger prevents negative balance`() {
    val allocated = 1000.0
    val approved = 800.0
    val pending = 500.0

    val summary = FinancialSummary.calculate(allocated, approved, pending)
    assertEquals(0.0, summary.availableBalance, 0.001)
  }
}
