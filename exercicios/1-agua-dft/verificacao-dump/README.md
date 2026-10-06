# Verificação de Dump no ORCA 6.1.1

Diagnóstico operacional em 6 de outubro de 2026; não é uma atividade extra nem uma trajetória para espectroscopia. Água, BLYP-D3BJ/def2-SVP, quatro passos de 0,5 fs. `Dump Properties` sem modificadores produziu um `.prop.log` com o estado inicial e blocos identificados para os passos 1 a 4, contendo dipolos. `Dump EnGrad Stride 2` produziu os arquivos dos passos 2 e 4. O teste XTB2 aceitou Properties, mas não produziu esse log.

[Input executado](probe_properties_dft.inp) · [Saída original](probe_properties_dft.out) · [Propriedades](probe_properties_dft.prop.log) · [Forças](probe_properties_dft-force.xyz) · [Energia e gradiente no passo 2](probe_properties_dft-step000002.engrad) · [Passo 4](probe_properties_dft-step000004.engrad).

O cabeçalho do dump de forças informa kJ mol⁻¹ Å⁻¹. O EnGrad informa Eh/bohr; compare F = −∇E somente depois da conversão de unidade. A tentativa de combinar `Dump Properties Stride 1 Filename ...` falhou nesta versão; o exemplo verificado usa apenas `Dump Properties`.

[Voltar ao complemento da água](../README.md#alem-das-posicoes).
