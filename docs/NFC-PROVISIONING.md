# NFC verification and NTAG 424 DNA provisioning

The API deliberately fails closed. `POST /api/visits/verify` needs a registered tag UID, an increasing scan counter, and a valid proof. A plain NFC UID is never enough to mark a visit verified.

The current `NFC_PROOF_SECRET` HMAC verifier is suitable only for a controlled development tag emulator. Before a physical launch, replace `verifyNfcProof` with the documented NTAG 424 DNA SDM verification implementation using per-tag keys stored in a KMS or HSM. It must decrypt the PICC data, check the CMAC, atomically enforce `counter > lastCounter`, and reject revoked tags.

Provision tags from the admin service only. Store the UID, restaurant relation, table label, and last accepted counter in `nfc_tags`; never store plaintext production tag keys in MongoDB. Deep links should include the encrypted SUN values and expire the review eligibility after six hours.
