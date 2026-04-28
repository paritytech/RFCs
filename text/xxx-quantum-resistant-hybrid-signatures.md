# RFC-XXXX: Quantum Resistant Hybrid Signatures

|                 |                                                                                       |
|-----------------|---------------------------------------------------------------------------------------|
| **Start Date**  | 15 April 2026                                                                         |
| **Description** | Introducing hybrid crypto types supporting both classical and post-quantum signatures |
| **Authors**     | Jeff Burdges, Elizabeth Crites, Syed Hosseini                                         |

## Summary

We propose new crypto types consisting of a pair of classical and quantum-resistant keys (FN-DSA: Falcon-512). Signature verification is carried out by verifying against both keys. The verification of the classical signature can optionally be disabled after migration to post-quantum cryptography. We add the minimum host calls and runtime support required for this cryptographic type.

## Motivation

While the potential invention of large quantum computers could compromise the security of classical cryptographic protocols, many cryptographers believe that in the near future it is more likely that an attack against a current quantum-resistant scheme will be discovered. As such, the proposed cryptographic type is suggested to allow Polkadot account holders who are concerned about both potential quantum attacks against classical schemes and possible failures of post-quantum schemes to migrate their accounts to a scheme that is resistant to both post-quantum attacks and possible failures of quantum-resistant schemes against potential classical attacks.

## Stakeholders

- **Runtime developers**: Teams building runtimes for which the new cryptographic type is available.
- **Polkadot Fellowship**: Responsible for maintaining and securing the host function implementations.

## Explanation

### Runtime application-crypto

This RFC adds `PairedCrypto` types of:

- `rs25519_fndsa`
- `ed25519_fndsa`
- `ecdsa_fndsa`

where `fndsa` complies with `FN-DSA-512` as specified in https://datatracker.ietf.org/doc/draft-ietf-cose-falcon/, in particular:

- `fndsa::PUBLIC_KEY_SERIALIZED_SIZE = 897`
- `fndsa::SIGNATURE_SERIALIZED_SIZE = 690`

It also adds 

- `rs25519_fndsa::app::Public`, `rs25519_fndsa::app::Signature`
- `ed25519_fndsa::app::Public`, `ed25519_fndsa::app::Signature`
- `ecdsa_fndsa::app::Public`, `ecdsa_fndsa::app::Signature`

### Host calls

### ext_crypto_fndsa_sign

Signs an input message using a given FN-DSA key.

#### Prototype

```wat
(func $ext_crypto_fndsa_sign_version_1
 (param $id i32) (param $pub_key i32) (param $msg i64) (param $out i64) (result i64))
```

#### Arguments

* `id` is a pointer ([Definition 215](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer)) to a key type identifier ([Definition 220](https://polkadotspec.dev/chap-host-api#defn-key-type-id)). The function will panic if the identifier is invalid;
* `pub_key` is a pointer ([Definition 215](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer)) to public key bytes;
* `msg` is a pointer-size ([Definition 216](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer-size)) to a message that is to be signed;
* `out` is a pointer ([Definition 215](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer)) to an output buffer, 690 bytes long, where the signature will be written.

#### Result

The function returns `0` on success. On error, `-1` is returned, and the output buffer should be considered uninitialized.

### ext_crypto_ecdsa_fndsa_generate

Generates a pair of (ECDSA,FN-DSA) keys for a given key type using an optional `seed`, stores it in the keystore, and returns the corresponding public key. The keystore and the runtime regard this pair as a single key.

#### Prototype

```wat
(func $ext_crypto_ecdsa_fndsa_generate_version_1
 (param $id i32) (param $seed i64) (param $out i32))
```

#### Arguments

* `id` is a pointer ([Definition 215](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer)) to a key type identifier ([Definition 220](https://polkadotspec.dev/chap-host-api#defn-key-type-id)). The function will panic if the identifier is invalid;
* `seed` is a pointer-size ([Definition 216](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer-size)) to a SCALE-encoded Option value ([Definition 200](https://polkadotspec.dev/id-cryptography-encoding#defn-option-type)) containing a BIP-39 seed which must be valid UTF-8. The function will panic if the seed is not a valid UTF-8;
* `out` is a pointer ([Definition 215](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer)) to an output buffer, 930 bytes long, where the public key will be written.

### ext_crypto_ecdsa_fndsa_public_keys

Retrieves all paired (ECDSA,FN-DSA) public keys of a given type from the keystore.

#### Prototype

```wat
(func $ext_crypto_ecdsa_fndsa_public_keys_version_1
 (param $id i32) (param $out i64) (result i32))
```

#### Arguments

* `id` is a pointer ([Definition 215](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer)) to a key type identifier ([Definition 220](https://polkadotspec.dev/chap-host-api#defn-key-type-id)). The function will panic if the identifier is invalid;
* `out` is a pointer-size ([Definition 216](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer-size)) to a buffer where the public keys of the given type known to the keystore will be stored consecutively. The value is actually stored only if the buffer is large enough. Otherwise, the buffer is not written into, and its contents are unchanged.

#### Result

The result is an unsigned 32-bit integer representing the total size in bytes required to store all public keys of the given type. The number of keys can be determined by dividing this value by the known key size (930 bytes for (ECDSA,FN-DSA)). A value of `0` indicates that no keys of the given type are known to the keystore.

### ext_crypto_ed25519_fndsa_generate

Generates a pair of (Ed25519,FN-DSA) keys for a given key type using an optional `seed`, stores it in the keystore, and returns the corresponding public key. The keystore and the runtime regard this pair as a single key.

#### Prototype

```wat
(func $ext_crypto_ed25519_fndsa_generate_version_1
 (param $id i32) (param $seed i64) (param $out i32))
```

#### Arguments

* `id` is a pointer ([Definition 215](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer)) to a key type identifier ([Definition 220](https://polkadotspec.dev/chap-host-api#defn-key-type-id)). The function will panic if the identifier is invalid;
* `seed` is a pointer-size ([Definition 216](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer-size)) to a SCALE-encoded Option value ([Definition 200](https://polkadotspec.dev/id-cryptography-encoding#defn-option-type)) containing a BIP-39 seed which must be valid UTF-8. The function will panic if the seed is not a valid UTF-8;
* `out` is a pointer ([Definition 215](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer)) to an output buffer, 929 bytes long, where the public key will be written.

### ext_crypto_ed25519_fndsa_public_keys

Retrieves all paired (Ed25519,FN-DSA) public keys of a given type from the keystore.

#### Prototype

```wat
(func $ext_crypto_ed25519_fndsa_public_keys_version_1
 (param $id i32) (param $out i64) (result i32))
```

#### Arguments

* `id` is a pointer ([Definition 215](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer)) to a key type identifier ([Definition 220](https://polkadotspec.dev/chap-host-api#defn-key-type-id)). The function will panic if the identifier is invalid;
* `out` is a pointer-size ([Definition 216](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer-size)) to a buffer where the public keys of the given type known to the keystore will be stored consecutively. The value is actually stored only if the buffer is large enough. Otherwise, the buffer is not written into, and its contents are unchanged.

#### Result

The result is an unsigned 32-bit integer representing the total size in bytes required to store all public keys of the given type. The number of keys can be determined by dividing this value by the known key size (929 bytes for (Ed25519,FN-DSA)). A value of `0` indicates that no keys of the given type are known to the keystore.

### ext_crypto_rs25519_fndsa_generate

Generates a pair of (Rs25519,FN-DSA) keys for a given key type using an optional `seed`, stores it in the keystore, and returns the corresponding public key. The keystore and the runtime regard this pair as a single key.

#### Prototype

```wat
(func $ext_crypto_rs25519_fndsa_generate_version_1
 (param $id i32) (param $seed i64) (param $out i32))
```

#### Arguments

* `id` is a pointer ([Definition 215](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer)) to a key type identifier ([Definition 220](https://polkadotspec.dev/chap-host-api#defn-key-type-id)). The function will panic if the identifier is invalid;
* `seed` is a pointer-size ([Definition 216](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer-size)) to a SCALE-encoded Option value ([Definition 200](https://polkadotspec.dev/id-cryptography-encoding#defn-option-type)) containing a BIP-39 seed which must be valid UTF-8. The function will panic if the seed is not a valid UTF-8;
* `out` is a pointer ([Definition 215](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer)) to an output buffer, 929 bytes long, where the public key will be written.

### ext_crypto_rs25519_fndsa_public_keys

Retrieves all paired (Rs25519,FN-DSA) public keys of a given type from the keystore.

#### Prototype

```wat
(func $ext_crypto_rs25519_fndsa_public_keys_version_1
 (param $id i32) (param $out i64) (result i32))
```

#### Arguments

* `id` is a pointer ([Definition 215](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer)) to a key type identifier ([Definition 220](https://polkadotspec.dev/chap-host-api#defn-key-type-id)). The function will panic if the identifier is invalid;
* `out` is a pointer-size ([Definition 216](https://polkadotspec.dev/chap-host-api#defn-runtime-pointer-size)) to a buffer where the public keys of the given type known to the keystore will be stored consecutively. The value is actually stored only if the buffer is large enough. Otherwise, the buffer is not written into, and its contents are unchanged.

#### Result

The result is an unsigned 32-bit integer representing the total size in bytes required to store all public keys of the given type. The number of keys can be determined by dividing this value by the known key size (929 bytes for (Rs25519,FN-DSA)). A value of `0` indicates that no keys of the given type are known to the keystore.

## Drawbacks

This RFC adds a significant number of host functions, but they are necessary in order to provide smooth migration of all types of accounts supported by Polkadot to quantum-resistant alternatives.

## Testing, Security, and Privacy

Implementations should use a well-tested library adhering to the test vectors provided by [the specification](https://datatracker.ietf.org/doc/draft-ietf-cose-falcon/).

## Performance, Ergonomics, and Compatibility


### Performance

FN-DSA (Falcon) is the smallest easily deployable post-quantum signature scheme: an FN-DSA signature plus public key winds up being almost 2.5x smaller than one coming from ML-DSA, but still 16x larger than using sr25519/ed25519. FN-DSA has similar verification times, roughly half that of sr25519 and ed25519. FN-DSA signers are roughly 4x slower than ML-DSA signers, which is already 5x slower than sr25519/ed25519. However, the verifier's efficiency is far more important than the signer's speed, since signatures are verified many more times than they are signed.

### Ergonomics

The host call interface is similar to the one for (ECDSA, BLS12-381) keys introduced by [RFC-156](https://github.com/polkadot-fellows/RFCs/blob/main/text/0156-bls-signatures.md).

### Compatibility

The proposal introduces new host functions, and as such parachains and validators need to upgrade their nodes to be compatible with the invocation of the new host calls in the runtime.

## Prior Art and References

- Fouque, P.-A., Kirchner, P., Pornin, T., and Y. Yu, "Use of Falcon in COSE", Internet-Draft draft-ietf-cose-falcon, IETF, <https://datatracker.ietf.org/doc/draft-ietf-cose-falcon/>.

- Perlner, R., "FIPS 206: FN-DSA (Falcon) — Status Update", NIST Computer Security Division, Sixth PQC Standardization Conference, 2025, <https://csrc.nist.gov/presentations/2025/fips-206-fn-dsa-falcon>.

- Pornin, T., "rust-fn-dsa: Rust implementation of FN-DSA (Falcon)", <https://github.com/pornin/rust-fn-dsa>.

## Unresolved Questions

We expect that FIPS-206 will be finalized in the near future. We expect that the deployed post-quantum scheme can be made standard-compliant with minimal changes.

## Future Directions and Related Material

Once this RFC is implemented, at-will migration to hybrid accounts that are resistant to both quantum attacks against classical schemes and classical attacks against post-quantum schemes will be possible. A subsequent RFC will introduce the deployment and migration path to such accounts.


