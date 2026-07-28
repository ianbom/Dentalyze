from app.services.model_registry import normalize_vit_state_dict_keys


def test_normalize_vit_state_dict_keys_maps_transformers_4_checkpoint_names():
    state_dict = {
        "module.vit.encoder.layer.0.attention.attention.query.weight": "q",
        "module.vit.encoder.layer.0.attention.attention.key.weight": "k",
        "module.vit.encoder.layer.0.attention.attention.value.weight": "v",
        "module.vit.encoder.layer.0.attention.output.dense.weight": "o",
        "module.vit.encoder.layer.0.intermediate.dense.weight": "fc1",
        "module.vit.encoder.layer.0.output.dense.weight": "fc2",
        "module.vit.encoder.layer.0.layernorm_before.weight": "before",
        "module.classifier.weight": "classifier",
    }

    normalized = normalize_vit_state_dict_keys(state_dict)

    assert normalized["vit.layers.0.attention.q_proj.weight"] == "q"
    assert normalized["vit.layers.0.attention.k_proj.weight"] == "k"
    assert normalized["vit.layers.0.attention.v_proj.weight"] == "v"
    assert normalized["vit.layers.0.attention.o_proj.weight"] == "o"
    assert normalized["vit.layers.0.mlp.fc1.weight"] == "fc1"
    assert normalized["vit.layers.0.mlp.fc2.weight"] == "fc2"
    assert normalized["vit.layers.0.layernorm_before.weight"] == "before"
    assert normalized["classifier.weight"] == "classifier"

