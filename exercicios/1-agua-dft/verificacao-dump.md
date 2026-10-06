# Verificação de Dump no ORCA 6.1.1

Diagnóstico operacional em 6 de outubro de 2026; não é uma atividade extra nem uma trajetória para espectroscopia. Água, BLYP-D3BJ/def2-SVP, quatro passos de 0,5 fs. `Dump Properties` sem modificadores produziu um `.prop.log` com o estado inicial e blocos identificados para os passos 1 a 4, contendo dipolos. `Dump EnGrad Stride 2` produziu os arquivos dos passos 2 e 4. O teste XTB2 aceitou Properties, mas não produziu esse log.

[Input executado](verificacao-dump/probe_properties_dft.inp) · [Saída original](verificacao-dump/probe_properties_dft.out) · [Propriedades](verificacao-dump/probe_properties_dft.prop.log) · [Forças](verificacao-dump/probe_properties_dft-force.xyz) · [Energia e gradiente no passo 2](verificacao-dump/probe_properties_dft-step000002.engrad) · [Passo 4](verificacao-dump/probe_properties_dft-step000004.engrad).

O cabeçalho do dump de forças informa kJ mol⁻¹ Å⁻¹. O EnGrad informa Eh/bohr; compare F = −∇E somente depois da conversão de unidade. A tentativa de combinar `Dump Properties Stride 1 Filename ...` falhou nesta versão; o exemplo verificado usa apenas `Dump Properties`.

[Voltar ao complemento da água](README.md#alem-das-posicoes).

## Diagnóstico operacional de Dump Properties e EnGrad

<!-- input-source: verificacao-dump/probe_properties_dft.inp -->
```text
! MD BLYP D3BJ def2-SVP PAL8
%maxcore 256
%md
 Timestep 0.5_fs
 Randomize 42
 Initvel 300_K
 Thermostat CSVR 300_K Timecon 100_fs
 Cell Sphere 0, 0, 0, 3_A Spring 10 Elastic 5_fs, 0.001 Pressure 1000
 Dump Position Stride 1 Filename "probe_properties_dft-traj.xyz"
 Dump Velocity Stride 1 Filename "probe_properties_dft-vel.xyz"
 Dump Force Stride 1 Filename "probe_properties_dft-force.xyz"
 Dump Properties
 Dump EnGrad Stride 2
 Run 4
 Screendump
end
* xyz 0 1
O -0.00000000000561 0.00000000000000 -0.07350969363937
H 0.00000000000281 0.76333729916205 0.51075484681968
H 0.00000000000281 -0.76333729916205 0.51075484681968
*
```

## Controle XTB2: execução normal, sem log de propriedades

Este diagnóstico curto terminou normalmente. Nesta configuração, `Dump Properties` não produziu `.prop.log`; os arquivos de posições, velocidades, forças e energia foram preservados.

<!-- input-source: verificacao-dump/probe_properties_simple.inp -->
```text
! MD XTB2 PAL8
%maxcore 256
%md
 Timestep 0.5_fs
 Randomize 42
 Initvel 300_K
 Thermostat CSVR 300_K Timecon 100_fs
 Cell Sphere 0, 0, 0, 3_A Spring 10 Elastic 5_fs, 0.001 Pressure 1000
 Dump Position Stride 1 Filename "probe_properties_simple-traj.xyz"
 Dump Velocity Stride 1 Filename "probe_properties_simple-vel.xyz"
 Dump Force Stride 1 Filename "probe_properties_simple-force.xyz"
 Dump Properties
 Run 4
 Screendump
end
* xyz 0 1
O -0.00000000000561 0.00000000000000 -0.07350969363937
H 0.00000000000281 0.76333729916205 0.51075484681968
H 0.00000000000281 -0.76333729916205 0.51075484681968
*
```

## Tentativa com modificadores: falha antes da dinâmica

Este input documenta a tentativa que falhou ao combinar `Properties` com modificadores. Não produziu passos MD. O laboratório abre a estrutura inicial e a saída da falha; use o input DFT verificado acima para o procedimento que funcionou.

<!-- input-source: verificacao-dump/probe_properties.inp -->
```text
! MD XTB2 PAL8
%maxcore 256
%md
 Timestep 0.5_fs
 Randomize 42
 Initvel 300_K
 Thermostat CSVR 300_K Timecon 100_fs
 Cell Sphere 0, 0, 0, 3_A Spring 10 Elastic 5_fs, 0.001 Pressure 1000
 Dump Position Stride 1 Filename "probe_properties-traj.xyz"
 Dump Velocity Stride 1 Filename "probe_properties-vel.xyz"
 Dump Force Stride 1 Filename "probe_properties-force.xyz"
 Dump Properties Stride 1 Filename "probe_properties-props"
 Run 4
 Screendump
end
* xyz 0 1
O -0.00000000000561 0.00000000000000 -0.07350969363937
H 0.00000000000281 0.76333729916205 0.51075484681968
H 0.00000000000281 -0.76333729916205 0.51075484681968
*
```
