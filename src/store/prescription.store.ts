import type { Prescription, PrescriptionDetail } from '~/types/outpatient'
import { createGlobalState, useLocalStorage } from '@vueuse/core'
import { genNo, nextNumericId } from '~/utils/outpatient'
import { buildPrescriptionSeed } from '~/data/doctor-mock'
import { buildPatientPrescriptionExtras } from '~/data/patient-mock'
import { useMedicineStore } from './medicine.store'

export const usePrescriptionStore = createGlobalState(() => {
  const list = useLocalStorage<Prescription[]>('outpatient-prescription-list-v3', [...buildPrescriptionSeed(), ...buildPatientPrescriptionExtras()])
  const { dataList: medicines, updateData: updateMedicine } = useMedicineStore()

  function createPrescription(input: {
    register_id: number
    doctor_id: number
    patient_id: number
    details: Omit<PrescriptionDetail, 'detail_id' | 'amount'>[]
  }): { ok: true, prescription: Prescription } | { ok: false, message: string } {
    const stockChecks: { mi: number, med: typeof medicines.value[0], next: number, qty: number }[] = []
    for (const d of input.details) {
      const mi = medicines.value.findIndex(m => m.medicine_id === d.medicine_id)
      const med = mi >= 0 ? medicines.value[mi]! : null
      if (med && mi >= 0) {
        const nextStock = med.stock - d.quantity
        if (nextStock < 0)
          return { ok: false as const, message: `药品「${med.name}」库存不足` }
        stockChecks.push({ mi, med, next: nextStock, qty: d.quantity })
      }
    }
    for (const c of stockChecks)
      updateMedicine(c.mi, { ...c.med, stock: c.next })

    const details: PrescriptionDetail[] = input.details.map((d, idx) => {
      const mi = medicines.value.findIndex(m => m.medicine_id === d.medicine_id)
      const med = mi >= 0 ? medicines.value[mi]! : null
      const unit_price = d.unit_price ?? med?.price ?? 0
      const amount = unit_price * d.quantity
      return {
        detail_id: idx + 1,
        medicine_id: d.medicine_id,
        quantity: d.quantity,
        unit_price,
        amount,
        usage: d.usage,
        dosage: d.dosage,
        days: d.days,
      }
    })
    const total = details.reduce((s, x) => s + x.amount, 0)
    const p: Prescription = {
      prescription_id: nextNumericId(list.value, 'prescription_id'),
      prescription_no: genNo('CF'),
      register_id: input.register_id,
      doctor_id: input.doctor_id,
      patient_id: input.patient_id,
      total_amount: Math.round(total * 100) / 100,
      status: 0,
      details,
    }
    list.value = [...list.value, p]
    return { ok: true as const, prescription: p }
  }

  function payPrescription(prescriptionId: number) {
    const i = list.value.findIndex(x => x.prescription_id === prescriptionId)
    if (i < 0)
      return false
    const x = list.value[i]!
    if (x.status !== 0)
      return true
    list.value[i] = { ...x, status: 1 }
    list.value = [...list.value]
    return true
  }

  function pickUp(prescriptionId: number) {
    const i = list.value.findIndex(x => x.prescription_id === prescriptionId)
    if (i < 0)
      return
    const x = list.value[i]!
    if (x.status === 1)
      list.value[i] = { ...x, status: 2 }
    list.value = [...list.value]
  }

  return { list, createPrescription, payPrescription, pickUp }
})
