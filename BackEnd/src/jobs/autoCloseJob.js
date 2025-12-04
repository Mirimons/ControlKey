import cron from 'node-cron'
import controlService from '../services/controlService.js'

class AutoCloseJob {
    init() {
        //Todo dia meia-noite:
        cron.schedule('0 23 * * *', async() => {
            try {
                console.log('Iniciando fechamento automático diário...')
                const result = await controlService.autoCloseControl()
                console.log('Fechamento automático concluído: ', result)
            }catch(error) {
                console.error('Erro no job de fechamento automático: ', error)
            }
        }, {
            timezone: "America/Sao_Paulo"
        });
        console.log('Job de fechamento automático agendado para 23:00 diariamente')
    }
}

export default new AutoCloseJob();